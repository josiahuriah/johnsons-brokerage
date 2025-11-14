/**
 * Plug n Pay Payment Gateway Integration
 *
 * This service handles all interactions with the Plug n Pay Remote Client API
 * API Documentation: https://www.plugnpay.com/developers
 */

const PLUGNPAY_API_URL = 'https://pay1.plugnpay.com/payment/pnpremote.cgi';

export interface PlugnPayConfig {
  publisherName: string;
  publisherPassword: string;
  mode?: 'test' | 'live';
}

export interface PaymentDetails {
  // Card Information
  cardNumber: string;
  cardName: string;
  cardExp: string; // Format: MM/YY
  cardCvv?: string;

  // Transaction Details
  amount: string; // Format: "10.00"
  currency?: string; // Default: USD

  // Customer Information
  email: string;
  phone?: string;

  // Billing Address
  billingName?: string;
  billingAddress1?: string;
  billingAddress2?: string;
  billingCity?: string;
  billingState?: string;
  billingZip?: string;
  billingCountry?: string;

  // Shipping Address (optional)
  shippingName?: string;
  shippingAddress1?: string;
  shippingAddress2?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingZip?: string;
  shippingCountry?: string;

  // Order Information
  orderID?: string;
  description?: string;
  ipAddress?: string;
}

export interface PlugnPayResponse {
  success: boolean;
  transactionId?: string;
  authCode?: string;
  message?: string;
  errorMessage?: string;
  finalStatus?: string;
  responseData?: Record<string, string>;
}

/**
 * Get Plug n Pay configuration from environment variables
 */
function getConfig(): PlugnPayConfig {
  const publisherName = process.env.PLUGNPAY_PUBLISHER_NAME;
  const publisherPassword = process.env.PLUGNPAY_PUBLISHER_PASSWORD;
  const mode = (process.env.PLUGNPAY_MODE || 'test') as 'test' | 'live';

  if (!publisherName || !publisherPassword) {
    throw new Error('Plug n Pay credentials not configured. Please set PLUGNPAY_PUBLISHER_NAME and PLUGNPAY_PUBLISHER_PASSWORD environment variables.');
  }

  return {
    publisherName,
    publisherPassword,
    mode,
  };
}

/**
 * Parse URL-encoded response from Plug n Pay
 */
function parseResponse(responseText: string): Record<string, string> {
  const params = new URLSearchParams(responseText);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Process a payment through Plug n Pay
 */
export async function processPayment(
  paymentDetails: PaymentDetails
): Promise<PlugnPayResponse> {
  const config = getConfig();

  // Build request parameters
  const params = new URLSearchParams({
    // Authentication
    'publisher-name': config.publisherName,
    'publisher-password': config.publisherPassword,

    // Mode
    'mode': 'auth',

    // Card Information
    'card-number': paymentDetails.cardNumber,
    'card-name': paymentDetails.cardName,
    'card-exp': paymentDetails.cardExp,
    'card-amount': paymentDetails.amount,

    // Customer Information
    'email': paymentDetails.email,

    // Conversion settings
    'convert': 'underscores',
  });

  // Add optional CVV
  if (paymentDetails.cardCvv) {
    params.append('card-cvv', paymentDetails.cardCvv);
  }

  // Add optional phone
  if (paymentDetails.phone) {
    params.append('phone', paymentDetails.phone);
  }

  // Add billing address if provided
  if (paymentDetails.billingName) {
    params.append('card-name', paymentDetails.billingName);
  }
  if (paymentDetails.billingAddress1) {
    params.append('card-address1', paymentDetails.billingAddress1);
  }
  if (paymentDetails.billingAddress2) {
    params.append('card-address2', paymentDetails.billingAddress2);
  }
  if (paymentDetails.billingCity) {
    params.append('card-city', paymentDetails.billingCity);
  }
  if (paymentDetails.billingState) {
    params.append('card-state', paymentDetails.billingState);
  }
  if (paymentDetails.billingZip) {
    params.append('card-zip', paymentDetails.billingZip);
  }
  if (paymentDetails.billingCountry) {
    params.append('card-country', paymentDetails.billingCountry);
  }

  // Add shipping address if provided
  if (paymentDetails.shippingName) {
    params.append('ship-name', paymentDetails.shippingName);
  }
  if (paymentDetails.shippingAddress1) {
    params.append('address1', paymentDetails.shippingAddress1);
  }
  if (paymentDetails.shippingAddress2) {
    params.append('address2', paymentDetails.shippingAddress2);
  }
  if (paymentDetails.shippingCity) {
    params.append('city', paymentDetails.shippingCity);
  }
  if (paymentDetails.shippingState) {
    params.append('state', paymentDetails.shippingState);
  }
  if (paymentDetails.shippingZip) {
    params.append('zip', paymentDetails.shippingZip);
  }
  if (paymentDetails.shippingCountry) {
    params.append('country', paymentDetails.shippingCountry);
  }

  // Add order information
  if (paymentDetails.orderID) {
    params.append('orderID', paymentDetails.orderID);
  }
  if (paymentDetails.description) {
    params.append('easycart', paymentDetails.description);
  }
  if (paymentDetails.ipAddress) {
    params.append('ipaddress', paymentDetails.ipAddress);
  }

  try {
    // Make API request
    const response = await fetch(PLUGNPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    // Parse response
    const responseText = await response.text();
    const responseData = parseResponse(responseText);

    // Check if payment was successful
    const finalStatus = responseData.FinalStatus || responseData.final_status || '';
    const isSuccess = finalStatus.toLowerCase() === 'success' ||
                     responseData.success === 'yes' ||
                     responseData.MErrMsg === '';

    if (isSuccess) {
      return {
        success: true,
        transactionId: responseData.orderID || responseData.order_id || '',
        authCode: responseData.auth_code || responseData.authcode || '',
        message: responseData.auth_msg || 'Payment successful',
        finalStatus,
        responseData,
      };
    } else {
      return {
        success: false,
        errorMessage: responseData.MErrMsg || responseData.auth_msg || 'Payment failed',
        finalStatus,
        responseData,
      };
    }
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Void a transaction
 */
export async function voidTransaction(
  orderID: string
): Promise<PlugnPayResponse> {
  const config = getConfig();

  const params = new URLSearchParams({
    'publisher-name': config.publisherName,
    'publisher-password': config.publisherPassword,
    'mode': 'void',
    'orderID': orderID,
  });

  try {
    const response = await fetch(PLUGNPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const responseText = await response.text();
    const responseData = parseResponse(responseText);

    const isSuccess = responseData.FinalStatus?.toLowerCase() === 'success' ||
                     responseData.success === 'yes';

    return {
      success: isSuccess,
      message: isSuccess ? 'Transaction voided successfully' : 'Failed to void transaction',
      errorMessage: isSuccess ? undefined : (responseData.MErrMsg || 'Void failed'),
      responseData,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Query transaction status
 */
export async function queryTransaction(
  orderID: string
): Promise<PlugnPayResponse> {
  const config = getConfig();

  const params = new URLSearchParams({
    'publisher-name': config.publisherName,
    'publisher-password': config.publisherPassword,
    'mode': 'query_trans',
    'orderID': orderID,
  });

  try {
    const response = await fetch(PLUGNPAY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      return {
        success: false,
        errorMessage: `HTTP Error: ${response.status} ${response.statusText}`,
      };
    }

    const responseText = await response.text();
    const responseData = parseResponse(responseText);

    return {
      success: true,
      transactionId: responseData.orderID || '',
      message: 'Transaction query successful',
      responseData,
    };
  } catch (error) {
    return {
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

/**
 * Mask credit card number for storage (show only last 4 digits)
 */
export function maskCardNumber(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');
  if (cleaned.length < 4) return '****';
  return '****' + cleaned.slice(-4);
}

/**
 * Validate credit card expiration format (MM/YY)
 */
export function validateCardExpiration(cardExp: string): boolean {
  const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
  if (!regex.test(cardExp)) return false;

  const [month, year] = cardExp.split('/').map(Number);
  const currentYear = new Date().getFullYear() % 100;
  const currentMonth = new Date().getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

/**
 * Get card brand from card number
 */
export function getCardBrand(cardNumber: string): string {
  const cleaned = cardNumber.replace(/\D/g, '');

  if (/^4/.test(cleaned)) return 'Visa';
  if (/^5[1-5]/.test(cleaned)) return 'Mastercard';
  if (/^3[47]/.test(cleaned)) return 'American Express';
  if (/^6(?:011|5)/.test(cleaned)) return 'Discover';

  return 'Unknown';
}
