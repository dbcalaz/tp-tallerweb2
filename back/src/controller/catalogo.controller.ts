import type { Request, Response } from "express";
import { CatalogoRepository } from "../repository/catalogo.repository.js";
import { CatalogoService } from "../services/catalogo.service.js";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/http.error.js";

const catalogoRepository = new CatalogoRepository();
const catalogoService = new CatalogoService(catalogoRepository);

export class CatalogoController {
    public getCatalogoAdmin = async (_req: Request, res: Response) => {
        const catalogo = await catalogoService.obtenerCatalogoAdmin();
        return res.status(200).json(catalogo);
    };

    public getOpcionesProducto = async (_req: Request, res: Response) => {
        return res.status(200).json(await catalogoService.obtenerOpcionesProducto());
    };

    public crearCategoria = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        const imagenUrl = req.body?.imagenUrl;
        if (!nombre) throw new BadRequestError("Ingresá un nombre de categoría.");
        if (!this.imagenValida(imagenUrl)) throw new BadRequestError("La imagen debe ser PNG, JPG, GIF o WebP y pesar hasta 5 MB.");
        return res.status(201).json(await this.run(() => catalogoService.crearCategoria(nombre, imagenUrl ?? null)));
    };

    public editarCategoria = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        const imagenUrl = req.body?.imagenUrl;
        if (!nombre) throw new BadRequestError("Ingresá un nombre de categoría.");
        if (!this.imagenValida(imagenUrl)) throw new BadRequestError("La imagen debe ser PNG, JPG, GIF o WebP y pesar hasta 5 MB.");
        return res.json(await this.run(() => catalogoService.editarCategoria(this.id(req), nombre, imagenUrl ?? null)));
    };

    public estadoCategoria = async (req: Request, res: Response) => res.json(await this.run(() => catalogoService.estadoCategoria(this.id(req), this.estado(req))));
    public crearTipo = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        const categoriaId = Number(req.body?.categoriaId ?? req.params.id);
        if (!nombre || !Number.isInteger(categoriaId) || categoriaId < 1) throw new BadRequestError("Ingresá un tipo y una categoría válidos.");
        return res.status(201).json(await this.run(() => catalogoService.crearTipo(nombre, categoriaId)));
    };
    public editarTipo = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        const categoriaId = Number(req.body?.categoriaId);
        if (!nombre || !Number.isInteger(categoriaId) || categoriaId < 1) throw new BadRequestError("Ingresá un tipo y una categoría válidos.");
        return res.json(await this.run(() => catalogoService.editarTipo(this.id(req), nombre, categoriaId)));
    };
    public estadoTipo = async (req: Request, res: Response) => res.json(await this.run(() => catalogoService.estadoTipo(this.id(req), this.estado(req))));
    public crearMarca = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        if (!nombre) throw new BadRequestError("Ingresá un nombre de marca.");
        return res.status(201).json(await this.run(() => catalogoService.crearMarca(nombre)));
    };
    public editarMarca = async (req: Request, res: Response) => {
        const nombre = this.nombre(req.body?.nombre);
        if (!nombre) throw new BadRequestError("Ingresá un nombre de marca.");
        return res.json(await this.run(() => catalogoService.editarMarca(this.id(req), nombre)));
    };
    public estadoMarca = async (req: Request, res: Response) => res.json(await this.run(() => catalogoService.estadoMarca(this.id(req), this.estado(req))));

    private nombre(value: unknown): string { return typeof value === "string" ? value.trim().slice(0, 80) : ""; }
    private id(req: Request): number { const id = Number(req.params.id); if (!Number.isInteger(id) || id < 1) throw new BadRequestError("Identificador inválido."); return id; }
    private estado(req: Request): boolean { if (typeof req.body?.activo !== "boolean") throw new BadRequestError("Indicá el estado activo."); return req.body.activo; }
    private imagenValida(value: unknown): boolean { return value == null || (typeof value === "string" && value.length <= 7_000_000 && (/^https?:\/\//i.test(value) || /^data:image\/(png|jpeg|webp|gif);base64,/i.test(value))); }
    private async run<T>(work: () => Promise<T>): Promise<T> {
        try { return await work(); } catch (error) {
            if (error && typeof error === "object" && "code" in error) {
                if (error.code === "P2002") throw new ConflictError("Ya existe un registro con ese nombre.");
                if (error.code === "P2025" || error.code === "P2003") throw new NotFoundError("No se encontró el registro relacionado.");
            }
            throw error;
        }
    }
}
