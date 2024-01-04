import fetch from "node-fetch";

const base = "https://api-m.sandbox.paypal.com";

const generateAccessToken = async () => {
    try {
        if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
            return { error: 'MISSING_API_CREDENTIALS' };
        }
        const auth = Buffer.from(
            process.env.PAYPAL_CLIENT_ID + ":" + process.env.PAYPAL_CLIENT_SECRET,
        ).toString('base64');
        const response = await fetch(`${base}/v1/oauth2/token`, {
            method: 'POST',
            body: 'grant_type=client_credentials',
            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();
        return data.access_token;

    } catch (error) {
        console.error("Failed to generate Access Token:", error.message);
    }
};

const createOrder = async (property) => {
    try {
        if (!property || typeof property !== 'object' || !property.cost) {
            return { error: 'INVALID_PROPERTY_OBJECT' };
        }

        const accessToken = await generateAccessToken();
        if (accessToken.error) {
            return { error: accessToken.error };
        }

        const url = `${base}/v2/checkout/orders`;

        const payload = {
            intent: "CAPTURE",
            purchase_units: [
                {
                    amount: {
                        currency_code: "USD",
                        value: property.cost,
                    },
                },
            ],
        };

        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
            method: "POST",
            body: JSON.stringify(payload),
        });

        return handleResponse(response);
    } catch (error) {
        console.error("Failed to create order:", error.message);
    }
};


const captureOrder = async (orderID) => {
    const accessToken = await generateAccessToken();
    if (accessToken.error) {
        return { error: accessToken.error };
    }

    const url = `${base}/v2/checkout/orders/${orderID}/capture`;

    const response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
        },
    });

    return handleResponse(response);
};

async function handleResponse(response) {
    try {
        const jsonResponse = await response.json();
        if (jsonResponse.error) {
            return { error: jsonResponse.error };
        }
        return {
            jsonResponse,
            httpStatusCode: response.status,
        };
    } catch (err) {
        const errorMessage = await response.text();
        console.log(errorMessage);
        return { error: 'error while handling the response' }
    }
}



export const paypalCreateOrder = async (req, res) => {
    try {
        const { property } = req.body;
        const result = await createOrder(property);

        if (result.error) {
            return res.json({ error: "Failed to create order.", error: result.error }).status(500);
        }

        const { jsonResponse, httpStatusCode } = result;
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to create order:", error);
        res.json({ error: "Failed to create order." }).status(500);
    }
};

export const paypalCaptureOrder = async (req, res) => {
    try {
        const { orderID } = req.params;
        const { jsonResponse, httpStatusCode } = await captureOrder(orderID);
        res.status(httpStatusCode).json(jsonResponse);
    } catch (error) {
        console.error("Failed to capture order:", error);
        res.json({ error: "Failed to capture order." }).status(500);
    }
};