import nodemailer from "nodemailer";

export class EmailService {
    async enviarEnlaceRecuperacion(destination: string, resetUrl: string): Promise<void> {
        const host = process.env.SMTP_HOST?.trim();
        const from = process.env.SMTP_FROM?.trim() || process.env.SMTP_USER?.trim();

        if (!host || !from) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("Falta configurar SMTP_HOST y SMTP_FROM para enviar recuperaciones.");
            }
            console.info(`[DEV] Enlace de recuperación: ${resetUrl}`);
            return;
        }

        const port = Number(process.env.SMTP_PORT || 587);
        const secure = process.env.SMTP_SECURE === "true";
        const user = process.env.SMTP_USER?.trim();
        const pass = process.env.SMTP_PASS?.replace(/\s+/g, "");
        const transporter = nodemailer.createTransport({
            host,
            port,
            secure,
            ...(user && pass ? { auth: { user, pass } } : {}),
        });

        await transporter.sendMail({
            from,
            to: destination,
            subject: "Restablecé tu contraseña de Tecnova",
            text: `Recibimos un pedido para cambiar tu contraseña. Abrí este enlace dentro de los próximos 30 minutos: ${resetUrl}\n\nSi no pediste el cambio, podés ignorar este correo.`,
            html: `<p>Recibimos un pedido para cambiar tu contraseña.</p><p><a href="${resetUrl}">Elegir una nueva contraseña</a></p><p>El enlace vence en 30 minutos. Si no pediste el cambio, ignorá este correo.</p>`,
        });
    }
}
