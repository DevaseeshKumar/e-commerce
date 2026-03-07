import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        await transporter.sendMail({
            from: `"ShopEasy" <${process.env.SMTP_EMAIL}>`,
            to,
            subject,
            html
        });
        return true;
    } catch (err) {
        console.error('Email error:', err.message);
        return false;
    }
};

const emailTemplates = {
    welcome: (name) => ({
        subject: 'Welcome to ShopEasy!',
        html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;border-radius:16px">
            <h1 style="font-size:24px;color:#111;margin:0 0 8px">Welcome, ${name}!</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 24px">Your ShopEasy account is ready. Start exploring thousands of curated products.</p>
            <a href="${process.env.CLIENT_URL}/login" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Start Shopping</a>
            <p style="color:#aaa;font-size:12px;margin:32px 0 0">ShopEasy — Premium E-Commerce</p>
        </div>`
    }),

    orderPlaced: (name, orderId, total) => ({
        subject: `Order Confirmed — #${orderId.slice(-8).toUpperCase()}`,
        html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;border-radius:16px">
            <h1 style="font-size:24px;color:#111;margin:0 0 8px">Order Confirmed</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 16px">Hi ${name}, your order has been placed successfully.</p>
            <div style="background:#f8f8f8;border-radius:12px;padding:20px;margin:0 0 24px">
                <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Order ID</p>
                <p style="margin:0 0 12px;color:#111;font-size:14px;font-family:monospace">#${orderId.slice(-8).toUpperCase()}</p>
                <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Total</p>
                <p style="margin:0;color:#111;font-size:20px;font-weight:700">$${total.toFixed(2)}</p>
            </div>
            <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">View Orders</a>
            <p style="color:#aaa;font-size:12px;margin:32px 0 0">ShopEasy — Premium E-Commerce</p>
        </div>`
    }),

    orderDelivered: (name, orderId) => ({
        subject: `Order Delivered — #${orderId.slice(-8).toUpperCase()}`,
        html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;border-radius:16px">
            <h1 style="font-size:24px;color:#111;margin:0 0 8px">Order Delivered</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 24px">Hi ${name}, your order #${orderId.slice(-8).toUpperCase()} has been delivered. We hope you love it!</p>
            <a href="${process.env.CLIENT_URL}/orders" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">View Order</a>
            <p style="color:#aaa;font-size:12px;margin:32px 0 0">ShopEasy — Premium E-Commerce</p>
        </div>`
    }),

    passwordReset: (name, resetUrl) => ({
        subject: 'Reset Your Password',
        html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;border-radius:16px">
            <h1 style="font-size:24px;color:#111;margin:0 0 8px">Reset Password</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 24px">Hi ${name}, click below to reset your password. This link expires in 1 hour.</p>
            <a href="${resetUrl}" style="display:inline-block;background:#111;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-weight:600;font-size:14px">Reset Password</a>
            <p style="color:#888;font-size:13px;margin:24px 0 0">If you didn't request this, ignore this email.</p>
            <p style="color:#aaa;font-size:12px;margin:16px 0 0">ShopEasy — Premium E-Commerce</p>
        </div>`
    }),

    incomingSupportMessage: (name, senderEmail, message) => ({
        subject: `[ShopEasy Support] New Message from ${name}`,
        html: `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;padding:40px 32px;background:#fff;border-radius:16px">
            <h1 style="font-size:24px;color:#111;margin:0 0 8px">New Support Request</h1>
            <p style="color:#666;font-size:15px;line-height:1.6;margin:0 0 24px">You have received a new contact submission.</p>
            <div style="background:#f8f8f8;border-radius:12px;padding:20px;margin:0 0 24px">
                <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Name</p>
                <p style="margin:0 0 12px;color:#111;font-size:14px;font-weight:600">${name}</p>
                <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Email</p>
                <p style="margin:0 0 12px;color:#111;font-size:14px"><a href="mailto:${senderEmail}" style="color:#3b82f6;text-decoration:none">${senderEmail}</a></p>
                <p style="margin:0 0 4px;color:#888;font-size:12px;text-transform:uppercase;letter-spacing:1px">Message</p>
                <p style="margin:0;color:#111;font-size:14px;white-space:pre-wrap;line-height:1.5">${message}</p>
            </div>
            <p style="color:#aaa;font-size:12px;margin:32px 0 0">ShopEasy — Premium E-Commerce automated forwarding</p>
        </div>`
    })
};

export { sendEmail, emailTemplates };
