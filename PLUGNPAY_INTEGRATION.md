# Plug n Pay Payment Gateway Integration

This document describes the Plug n Pay payment gateway integration implemented for Val's Brokerage.

## Overview

The site has been integrated with Plug n Pay's Remote Client API to process real credit card payments for both:
1. **Invoice Payments** - Customers paying outstanding invoices
2. **Product Purchases** - Customers purchasing digital products

## Configuration

### Environment Variables

Add the following environment variables to your `.env` file:

```bash
# Plug n Pay Payment Gateway Credentials
PLUGNPAY_PUBLISHER_NAME=your_publisher_name_here
PLUGNPAY_PUBLISHER_PASSWORD=your_publisher_password_here
PLUGNPAY_MODE=test  # Use 'test' for testing, 'live' for production
```

### Getting Your Credentials

1. Log in to your Plug n Pay merchant account at https://www.plugnpay.com
2. Navigate to **Security Administration** settings
3. Find your **Publisher Name** under Username/Password Configuration
4. Generate a **Remote Client Password**

For assistance, contact Plug n Pay support:
- Email: support@plugnpay.com
- Phone: 800-945-2538

## Architecture

### Files Created/Modified

#### New Files:
- **`src/lib/plugnpay.ts`** - Core Plug n Pay API integration service
  - `processPayment()` - Process a credit card payment
  - `voidTransaction()` - Void a transaction
  - `queryTransaction()` - Query transaction status
  - Utility functions for card validation and formatting

- **`.env.example`** - Environment variable template

- **`PLUGNPAY_INTEGRATION.md`** - This documentation file

#### Modified Files:
- **`src/app/api/invoice/payment/route.ts`** - Updated to use Plug n Pay for invoice payments
- **`src/app/api/mock-payment/route.tsx`** - Updated to use Plug n Pay for product purchases
- **`src/app/(customerFacing)/invoice-payment/InvoicePaymentForm.tsx`** - Enhanced with billing address fields and full card details
- **`src/app/(customerFacing)/products/[id]/purchase/components/CheckoutForm.tsx`** - Updated to send full card details to Plug n Pay

## How It Works

### Payment Flow

#### Invoice Payments
1. Customer enters invoice number and verifies it exists
2. Customer fills in:
   - Contact information (email, phone)
   - Billing address (optional but recommended)
   - Card details (number, expiry, CVV, cardholder name)
   - Payment amount
3. Frontend validates all inputs
4. API processes payment through Plug n Pay:
   - Calls `processPayment()` with card details
   - Plug n Pay authorizes and captures the transaction
   - Returns transaction ID and authorization code
5. On success:
   - Creates Payment record in database
   - Updates Invoice status and paid amount
   - Redirects to receipt page
6. On failure:
   - Displays error message from Plug n Pay
   - No database changes made

#### Product Purchases
1. Customer selects a product to purchase
2. Customer fills in:
   - Email address
   - Card details (number, expiry, CVV, cardholder name)
3. System checks if customer already purchased the product
4. API processes payment through Plug n Pay
5. On success:
   - Creates/updates User record
   - Creates Order record
   - Generates download verification link
   - Sends confirmation email
   - Redirects to success page

### API Integration

The Plug n Pay service (`src/lib/plugnpay.ts`) communicates with:
- **Endpoint:** `https://pay1.plugnpay.com/payment/pnpremote.cgi`
- **Method:** POST with URL-encoded parameters
- **Authentication:** Publisher name and password

#### Request Parameters
```typescript
{
  'publisher-name': string
  'publisher-password': string
  'mode': 'auth' | 'void' | 'query_trans'
  'card-number': string
  'card-name': string
  'card-exp': string  // MM/YY format
  'card-cvv': string
  'card-amount': string  // Format: "10.00"
  'email': string
  'orderID': string
  // Optional billing/shipping fields
  'card-address1': string
  'card-city': string
  'card-state': string
  'card-zip': string
  // etc.
}
```

#### Response Format
Plug n Pay returns URL-encoded key-value pairs:
```
FinalStatus=success&orderID=INV-123-456&auth_code=ABC123&...
```

The service parses these and returns a structured response:
```typescript
{
  success: boolean
  transactionId?: string
  authCode?: string
  message?: string
  errorMessage?: string
  responseData?: Record<string, string>
}
```

## Security Features

### PCI Compliance Considerations

1. **Card Data Handling:**
   - Full card numbers are only transmitted via HTTPS to Plug n Pay
   - Card numbers are NEVER stored in the database
   - Only last 4 digits are stored for reference
   - CVV codes are transmitted but never stored

2. **Validation:**
   - Client-side validation for card format, expiry, CVV
   - Server-side validation before processing
   - Email and amount validation

3. **Error Handling:**
   - Failed payments don't create database records
   - Detailed error messages from payment processor
   - Transaction logging for debugging

4. **IP Address Tracking:**
   - Client IP address sent with each transaction
   - Helps with fraud detection

### Data Stored in Database

**Payment Table:**
- Payment number
- Transaction ID (from Plug n Pay)
- Authorization code
- Last 4 digits of card
- Card brand (Visa, Mastercard, etc.)
- Payment amount
- Payment status
- Processor response message
- Customer contact info

## Testing

### Test Mode

Set `PLUGNPAY_MODE=test` in your `.env` file to use Plug n Pay's test environment.

### Test Cards

Contact Plug n Pay support for test card numbers that work in their test environment. Common test card formats:
- Visa: 4242424242424242
- Mastercard: 5555555555554444

Note: Test card numbers may vary - always verify with Plug n Pay documentation.

## Error Handling

### Common Errors

1. **"Plug n Pay credentials not configured"**
   - Missing environment variables
   - Solution: Set `PLUGNPAY_PUBLISHER_NAME` and `PLUGNPAY_PUBLISHER_PASSWORD`

2. **"Payment failed" with processor error**
   - Card declined by issuing bank
   - Invalid card details
   - Insufficient funds
   - Solution: Customer should try different card or contact their bank

3. **"HTTP Error: 403"**
   - Authentication failed
   - Invalid credentials
   - Solution: Verify credentials in Plug n Pay merchant account

4. **Network timeout**
   - Plug n Pay API unavailable
   - Network connectivity issues
   - Solution: Retry payment or contact Plug n Pay support

## Monitoring and Logging

### Server-Side Logging

All payment processing includes console logging:
```typescript
console.error("Payment processing error:", error)
```

### Database Tracking

Every successful payment creates a record with:
- Transaction ID
- Authorization code
- Processor response
- Timestamp

Query payments:
```sql
SELECT * FROM Payment WHERE paymentStatus = 'COMPLETED' ORDER BY createdAt DESC;
```

## Production Deployment Checklist

- [ ] Obtain production Plug n Pay credentials
- [ ] Set `PLUGNPAY_MODE=live` in production environment
- [ ] Test with real cards in production (small amounts)
- [ ] Set up proper error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure HTTPS/SSL certificate
- [ ] Review PCI compliance requirements
- [ ] Set up webhook notifications (if needed)
- [ ] Configure backup payment processor (optional)
- [ ] Test refund/void workflows
- [ ] Document customer support procedures

## Support and Troubleshooting

### Plug n Pay Support
- Website: https://www.plugnpay.com
- Email: support@plugnpay.com
- Phone: 800-945-2538
- Sales: sales@plugnpay.com or ext. 3008

### Developer Resources
- Plug n Pay Developer Portal: https://www.plugnpay.com/developers
- API Documentation: Contact support for access

### Internal Support

For issues with the integration:
1. Check server logs for error messages
2. Verify environment variables are set correctly
3. Test with known working card numbers
4. Review Plug n Pay transaction logs in merchant account
5. Contact Plug n Pay support for payment-specific issues

## Future Enhancements

Potential improvements to consider:

1. **Saved Payment Methods**
   - Store customer payment profiles in Plug n Pay
   - Use `list_members` API mode
   - Implement saved card selection

2. **Recurring Billing**
   - Set up subscription payments
   - Automatic invoice payment

3. **Partial Refunds**
   - Implement refund API calls
   - Admin interface for refunds

4. **Enhanced Reporting**
   - Payment analytics dashboard
   - Revenue reports
   - Failed payment tracking

5. **Multi-Currency Support**
   - Add currency parameter
   - Currency conversion

6. **3D Secure**
   - Implement additional authentication
   - Reduce fraud risk

## Changelog

### Version 1.0.0 - 2025-11-14
- Initial Plug n Pay integration
- Invoice payment processing
- Product purchase processing
- Billing address collection
- Full card validation
- Error handling and logging
- Documentation
