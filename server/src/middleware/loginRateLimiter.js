// middleware/authLimit.js
import { RateLimiterRedis } from "rate-limiter-flexible";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

const WHITELIST_IPS = (process.env.WHITELIST_IPS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)

// Limits
const maxAttemptsByIP = 10; // e.g., 7 attempts per window
const maxAttemptsByEmail = 5; // 5 failed logins per email

const IpBlockDuration = 30 * 60; // 30 mins lockdown
const EmailBlockDuration = 30 * 60; // 30 mins lockdown

const IpResetWindow = 30 * 60; // 30 mins Reset window
const EmailResetWindow = 30 * 60; // 30 mins Reset Window

// Rate limiters
const limiterSlowBruteByIP = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_ip",
  points: maxAttemptsByIP,
  duration: IpResetWindow, // 1 minute window
  blockDuration: IpBlockDuration, // Block 15 minutes if exceeded
});

function isIpWhitelisted(ip) {
  if (!ip) {
    console.log("No IP provided");
    return false;
  }

  const clean = ip.replace(/^::ffff:/, "");

  // Only split on colon if it's not an IPv6 address
  const cleanIP = clean.includes(".") ? clean.split(":")[0] : clean;

  console.log({
    originalIP: ip,
    cleanIP: cleanIP,
    whitelist: WHITELIST_IPS,
    isWhitelisted: WHITELIST_IPS.includes(cleanIP),
  });

  return WHITELIST_IPS.includes(cleanIP);
}

async function consumeIfNotWhitelisted(ip) {
  console.log("Checking IP:", ip);
  const whitelisted = isIpWhitelisted(ip);
  console.log("Is whitelisted:", whitelisted);

  if (whitelisted) {
    console.log("IP is whitelisted, skipping rate limit");
    return true;
  }

  console.log("IP not whitelisted, applying rate limit");
  return limiterSlowBruteByIP.consume(ip);
}

const limiterConsecutiveFailsByEmail = new RateLimiterRedis({
  storeClient: redisClient,
  keyPrefix: "login_fail_email",
  points: maxAttemptsByEmail,
  duration: EmailResetWindow,
  blockDuration: EmailBlockDuration,
});

export {
  limiterSlowBruteByIP,
  limiterConsecutiveFailsByEmail,
  redisClient,
  isIpWhitelisted,
  consumeIfNotWhitelisted,
};

// Express middleware wrapper for login rate limiting
export async function loginRateLimiter(req, res, next) {
  try {
    await consumeIfNotWhitelisted(req.ip);
    return next();
  } catch (rateLimiterRes) {
    const retrySecs = Math.ceil((rateLimiterRes?.msBeforeNext || 0) / 1000);
    res.set("Retry-After", String(retrySecs || 60));
    return res.status(429).json({
      message: `Too many login attempts. Try again in ${retrySecs || 60}s.`,
    });
  }
}

// Returns true when a security email should be sent (first time threshold hit)
export async function shouldSendLoginAlert(email) {
  if (!email) return false;
  const emailKey = email.toLowerCase();
  try {
    const res = await limiterConsecutiveFailsByEmail.consume(emailKey);
    if (res.remainingPoints === 0) {
      return await markLoginAlertIfNotSent(emailKey);
    }
    return false;
  } catch {
    return await markLoginAlertIfNotSent(emailKey);
  }
}

export async function resetLoginAlerts(email) {
  if (!email) return;
  const emailKey = email.toLowerCase();
  await limiterConsecutiveFailsByEmail.delete(emailKey);
  await redisClient.del(`login_alert_sent:${emailKey}`);
}

async function markLoginAlertIfNotSent(emailKey) {
  const key = `login_alert_sent:${emailKey}`;
  const already = await redisClient.get(key);
  if (already) return false;
  await redisClient.set(key, "1", "EX", EmailBlockDuration);
  return true;
}
