/**
 * The Courier Guy (TCG) API integration.
 * Docs: https://api.thecourierguy.co.za
 */

const TCG_BASE = process.env.TCG_API_BASE || "https://api.thecourierguy.co.za/api";
const TCG_API_KEY = process.env.TCG_API_KEY || "";

async function tcgFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${TCG_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TCG_API_KEY}`,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TCG API error ${res.status}: ${text}`);
  }

  return res.json();
}

export interface TCGQuoteRequest {
  collectionAddress: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };
  deliveryAddress: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };
  parcel: {
    weight: number;   // kg
    height: number;   // cm
    width: number;    // cm
    length: number;   // cm
  };
}

export interface TCGQuoteResult {
  serviceId: string;
  serviceName: string;
  price: number;
  estimatedDeliveryDays: number;
}

/**
 * Get shipping rate quotes from TCG.
 * Returns available services with prices.
 */
export async function getShippingQuotes(req: TCGQuoteRequest): Promise<TCGQuoteResult[]> {
  if (!TCG_API_KEY) {
    // Return a flat-rate fallback when not configured
    return [
      {
        serviceId: "standard",
        serviceName: "Standard Delivery",
        price: 99,
        estimatedDeliveryDays: 3,
      },
      {
        serviceId: "express",
        serviceName: "Express Delivery",
        price: 159,
        estimatedDeliveryDays: 1,
      },
    ];
  }

  try {
    const payload = {
      Collection: {
        Address1: req.collectionAddress.streetAddress,
        SuburbCode: req.collectionAddress.suburb,
        CityCode: req.collectionAddress.city,
        Province: req.collectionAddress.province,
        PostCode: req.collectionAddress.postalCode,
      },
      Delivery: {
        Address1: req.deliveryAddress.streetAddress,
        SuburbCode: req.deliveryAddress.suburb,
        CityCode: req.deliveryAddress.city,
        Province: req.deliveryAddress.province,
        PostCode: req.deliveryAddress.postalCode,
      },
      Parcels: [
        {
          Weight: req.parcel.weight,
          Height: req.parcel.height,
          Width: req.parcel.width,
          Length: req.parcel.length,
        },
      ],
    };

    const data = await tcgFetch("/v2/getQuote", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    // Map TCG response format
    return (data.Services || []).map((s: { ServiceCode: string; ServiceName: string; Rate: number | string; EstimatedDeliveryDays: number }) => ({
      serviceId: s.ServiceCode,
      serviceName: s.ServiceName,
      price: parseFloat(String(s.Rate)),
      estimatedDeliveryDays: s.EstimatedDeliveryDays || 3,
    }));
  } catch (err) {
    console.error("TCG quote error:", err);
    // Fallback rates
    return [
      { serviceId: "standard", serviceName: "Standard Delivery", price: 99, estimatedDeliveryDays: 3 },
      { serviceId: "express", serviceName: "Express Delivery", price: 159, estimatedDeliveryDays: 1 },
    ];
  }
}

export interface TCGShipmentRequest {
  orderId: string;
  serviceId: string;
  recipientName: string;
  recipientPhone: string;
  recipientEmail: string;
  deliveryAddress: {
    streetAddress: string;
    suburb: string;
    city: string;
    province: string;
    postalCode: string;
  };
  parcel: {
    weight: number;
    height: number;
    width: number;
    length: number;
    description: string;
  };
  declaredValue: number;
}

/**
 * Create a shipment/waybill with TCG.
 * Returns waybill number and tracking number.
 */
export async function createShipment(req: TCGShipmentRequest): Promise<{
  waybillNumber: string;
  trackingNumber: string;
  labelUrl?: string;
}> {
  if (!TCG_API_KEY) {
    // Mock response when not configured
    return {
      waybillNumber: `WB${Date.now()}`,
      trackingNumber: `TRK${Date.now()}`,
    };
  }

  const payload = {
    ServiceCode: req.serviceId,
    Reference: req.orderId,
    Delivery: {
      Name: req.recipientName,
      Phone: req.recipientPhone,
      Email: req.recipientEmail,
      Address1: req.deliveryAddress.streetAddress,
      SuburbCode: req.deliveryAddress.suburb,
      CityCode: req.deliveryAddress.city,
      Province: req.deliveryAddress.province,
      PostCode: req.deliveryAddress.postalCode,
    },
    Collection: {
      Name: process.env.TCG_SENDER_NAME || "Netso",
      Phone: process.env.TCG_SENDER_PHONE || "",
      Address1: process.env.TCG_SENDER_ADDRESS || "",
      SuburbCode: process.env.TCG_SENDER_SUBURB || "",
      CityCode: process.env.TCG_SENDER_CITY || "",
      Province: process.env.TCG_SENDER_PROVINCE || "",
      PostCode: process.env.TCG_SENDER_POSTAL_CODE || "",
    },
    Parcels: [
      {
        Weight: req.parcel.weight,
        Height: req.parcel.height,
        Width: req.parcel.width,
        Length: req.parcel.length,
        Description: req.parcel.description,
        DeclaredValue: req.declaredValue,
      },
    ],
  };

  const data = await tcgFetch("/v2/createShipment", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return {
    waybillNumber: data.WaybillNumber || data.waybillNumber || "",
    trackingNumber: data.TrackingNumber || data.trackingNumber || "",
    labelUrl: data.LabelUrl || data.labelUrl,
  };
}

/**
 * Get tracking status for a waybill.
 */
export async function trackShipment(waybillNumber: string) {
  if (!TCG_API_KEY) return null;
  try {
    return await tcgFetch(`/v2/tracking/${waybillNumber}`);
  } catch {
    return null;
  }
}
