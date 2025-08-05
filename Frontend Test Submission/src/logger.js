// A2305222358/Logging Middleware/logger.js

const AFFORDMED_BASE_URL = "http://20.244.56.144/evaluation-service";

const USER_CREDENTIALS = {
    email: "ramkrishna@abc.edu",
    name: "ram krishna",
    mobileNo: "9999999999",
    githubUsername: "github",
    rollNo: "aa1bb",
    accessCode: "FzRGjY"
};

let CLIENT_ID = "";
let CLIENT_SECRET = "";
let AUTH_TOKEN = "";

async function exponentialBackoff(fn, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            if (i === retries - 1) {
                console.error(`Max retries reached. Failed to execute function:`, error);
                throw error;
            }
            console.warn(`Attempt ${i + 1}/${retries} failed. Retrying in ${delay}ms...`, error.message);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2;
        }
    }
}

async function makeApiRequest(url, options = {}) {
    try {
        const response = await fetch(url, options);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(`API request failed: ${response.status} - ${errorData.message || 'Unknown error'}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error during API request to ${url}:`, error);
        throw error;
    }
}

export async function registerUser() {
    const url = `${AFFORDMED_BASE_URL}/register`;
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(USER_CREDENTIALS),
    };

    console.log("Attempting to register user...");
    try {
        const data = await exponentialBackoff(() => makeApiRequest(url, options));
        CLIENT_ID = data.clientID;
        CLIENT_SECRET = data.clientSecret;
        console.log("User registered successfully:", data);
        return data;
    } catch (error) {
        console.error("Failed to register user:", error);
        throw error;
    }
}

export async function authenticateUser() {
    const url = `${AFFORDMED_BASE_URL}/auth`;
    const authPayload = {
        email: USER_CREDENTIALS.email,
        name: USER_CREDENTIALS.name,
        rollNo: USER_CREDENTIALS.rollNo,
        clientID: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(authPayload),
    };

    console.log("Attempting to authenticate user...");
    try {
        const data = await exponentialBackoff(() => makeApiRequest(url, options));
        AUTH_TOKEN = data.access_token;
        console.log("User authenticated successfully. Token obtained.");
        return AUTH_TOKEN;
    } catch (error) {
        console.error("Failed to authenticate user:", error);
        throw error;
    }
}

export async function logEvent(stack, level, pkg, message) {
    if (!AUTH_TOKEN) {
        console.warn("No authentication token available. Attempting to authenticate...");
        try {
            await authenticateUser();
        } catch (authError) {
            console.error("Could not authenticate to send log. Log event dropped:", message, authError);
            return;
        }
    }

    const url = `${AFFORDMED_BASE_URL}/logs`;
    const logPayload = {
        stack,
        level,
        package: pkg,
        message,
    };
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AUTH_TOKEN}`,
        },
        body: JSON.stringify(logPayload),
    };

    console.log(`Sending log: [${level.toUpperCase()}] ${stack}/${pkg}: ${message}`);
    try {
        const data = await exponentialBackoff(() => makeApiRequest(url, options));
        console.log("Log event sent successfully:", data);
        return data;
    } catch (error) {
        console.error("Failed to send log event:", error);
        throw error;
    }
}
