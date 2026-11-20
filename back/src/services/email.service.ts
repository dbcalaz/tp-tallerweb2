import nodemailer from "nodemailer";

export class EmailService {
    private async createTransporter() {
        const host = process.env.SMTP_HOST?.trim();
        const smtpFrom = process.env.SMTP_FROM?.trim();
        const smtpUser = process.env.SMTP_USER?.trim();
        const from = smtpFrom || (smtpUser ? `"Tecnova" <${smtpUser}>` : undefined);

        if (!host || !from) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("Falta configurar SMTP_HOST y SMTP_FROM para enviar correos.");
            }
            return null;
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

        return { transporter, from };
    }

    async enviarEnlaceRecuperacion(destination: string, resetUrl: string): Promise<void> {
        const config = await this.createTransporter();
        if (!config) {
            console.info(`[DEV] Enlace de recuperación: ${resetUrl}`);
            return;
        }

        const { transporter, from } = config;
        await transporter.sendMail({
            from,
            to: destination,
            subject: "Restablecé tu contraseña de Tecnova",
            text: `Recibimos un pedido para cambiar tu contraseña. Abrí este enlace dentro de los próximos 30 minutos: ${resetUrl}\n\nSi no pediste el cambio, podés ignorar este correo.`,
            html: `<p>Recibimos un pedido para cambiar tu contraseña.</p><p><a href="${resetUrl}">Elegir una nueva contraseña</a></p><p>El enlace vence en 30 minutos. Si no pediste el cambio, ignorá este correo.</p>`,
        });
    }

    async enviarComprobanteCompra(
        destination: string,
        compradorNombre: string,
        orderId: string,
        fechaCompra: string,
        productos: Array<{ nombre: string; cantidad: number; subtotal: number }>,
        installments: number,
        total: number,
        direccionEnvio: string,
    ): Promise<void> {
        const config = await this.createTransporter();
        if (!config) {
            console.info(`[DEV] Comprobante de compra #${orderId} para ${destination}`);
            return;
        }

        const { transporter, from } = config;
        const productosHtml = productos
            .map(
                (p) => `
                <tr>
                    <td style="padding: 8px; border-bottom: 1px solid #eee;">${p.nombre}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${p.cantidad}</td>
                    <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${p.subtotal.toLocaleString('es-AR')}</td>
                </tr>
            `,
            )
            .join("");

        const cuotasTexto = installments === 1 ? "1 pago" : `${installments} cuotas fijas`;
        const cuotaMonto = installments === 1 ? total : Math.round(total / installments);

        const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #0b1721;">¡Hola ${compradorNombre}!</h2>
                <p>Tu compra en <strong>Tecnova</strong> se realizó con éxito.</p>
                
                <div style="background: #f7f9ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Número de orden:</strong> ${orderId}</p>
                    <p><strong>Fecha:</strong> ${fechaCompra}</p>
                    <p><strong>Estado:</strong> COMPLETADA</p>
                </div>

                <h3 style="color: #0b1721; margin-top: 24px;">Productos comprados</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                    <thead>
                        <tr style="background: #edf4ff;">
                            <th style="padding: 8px; text-align: left; border-bottom: 2px solid #ddd;">Producto</th>
                            <th style="padding: 8px; text-align: center; border-bottom: 2px solid #ddd;">Cantidad</th>
                            <th style="padding: 8px; text-align: right; border-bottom: 2px solid #ddd;">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${productosHtml}
                    </tbody>
                </table>

                <div style="background: #edf4ff; padding: 16px; border-radius: 8px; margin: 16px 0;">
                    <p><strong>Plan de pago:</strong> ${cuotasTexto}${installments > 1 ? ` de $${cuotaMonto.toLocaleString('es-AR')} ARS` : ''}</p>
                    <p><strong>Total abonado:</strong> $${total.toLocaleString('es-AR')} ARS</p>
                    <p><strong>Dirección de entrega:</strong> ${direccionEnvio}</p>
                </div>

                <p style="color: #666; font-size: 14px; margin-top: 24px;">
                    Si tenés alguna consulta, contactá a nuestro equipo de soporte con el código <strong>${orderId}</strong>.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                    Gracias por tu compra en Tecnova.
                </p>
            </div>
        `;

        await transporter.sendMail({
            from,
            to: destination,
            subject: `Comprobante de compra ${orderId} - Tecnova`,
            text: `¡Hola ${compradorNombre}! Tu compra #${orderId} se realizó con éxito. Total: $${total.toLocaleString('es-AR')} ARS.`,
            html,
        });
    }
}
