import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando seed de productos...');

  // Crear categorías
  const categoria1 = await prisma.categoria.upsert({
    where: { nombre: 'Notebooks' },
    update: {},
    create: { nombre: 'Notebooks' },
  });

  const categoria2 = await prisma.categoria.upsert({
    where: { nombre: 'Periféricos' },
    update: {},
    create: { nombre: 'Periféricos' },
  });

  const categoria3 = await prisma.categoria.upsert({
    where: { nombre: 'Monitores' },
    update: {},
    create: { nombre: 'Monitores' },
  });

  const categoria4 = await prisma.categoria.upsert({
    where: { nombre: 'Componentes' },
    update: {},
    create: { nombre: 'Componentes' },
  });

  // Crear tipos de producto
  const tipo1 = await prisma.tipoProducto.upsert({
    where: { nombre_categoriaId: { nombre: 'Workstation', categoriaId: categoria1.id } },
    update: {},
    create: { nombre: 'Workstation', categoriaId: categoria1.id },
  });

  const tipo2 = await prisma.tipoProducto.upsert({
    where: { nombre_categoriaId: { nombre: 'Teclados', categoriaId: categoria2.id } },
    update: {},
    create: { nombre: 'Teclados', categoriaId: categoria2.id },
  });

  const tipo3 = await prisma.tipoProducto.upsert({
    where: { nombre_categoriaId: { nombre: 'IPS 4K', categoriaId: categoria3.id } },
    update: {},
    create: { nombre: 'IPS 4K', categoriaId: categoria3.id },
  });

  const tipo4 = await prisma.tipoProducto.upsert({
    where: { nombre_categoriaId: { nombre: 'Placas de Video', categoriaId: categoria4.id } },
    update: {},
    create: { nombre: 'Placas de Video', categoriaId: categoria4.id },
  });

  // Crear marcas
  const marca1 = await prisma.marca.upsert({
    where: { nombre: 'Dell' },
    update: {},
    create: { nombre: 'Dell' },
  });

  const marca2 = await prisma.marca.upsert({
    where: { nombre: 'Keychron' },
    update: {},
    create: { nombre: 'Keychron' },
  });

  const marca3 = await prisma.marca.upsert({
    where: { nombre: 'ASUS' },
    update: {},
    create: { nombre: 'ASUS' },
  });

  // Crear productos
  const producto1 = await prisma.producto.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nombre: 'Dell XPS 15 9530 Core i7 32GB 1TB SSD RTX 4060',
      descripcion: 'Workstation portátil de alto rendimiento',
      precio: 2849999,
      imagenUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDjVOFkJdsbTWG-9-KREHb4tRuLszUXn1PT0_UcllhuXElyuSi9cwl4gOhgqZ3SuaA5SYqgWPRx5VCAQJ-pgaa9nqKF3rRophRn54Qph6NEibC--LUgCd60NhGh6VHaf70pL5bNtjPxvkZw_AZWswxh9Ufoy3c4Yy6cF6Jpi5CatBoRAuGoTtY6IeYeMgjJT4x4_xHI-hxP3Kp_HUC4NUfhHYIzqGDIfOVjD3fk11iz',
      tipoProductoId: tipo1.id,
      marcaId: marca1.id,
      stock: 10,
      activo: true,
    },
  });

  const producto2 = await prisma.producto.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nombre: 'Teclado Mecánico Custom Keychron Q1 Pro Wireless Gateron Brown',
      descripcion: 'Teclado mecánico wireless programable',
      precio: 329900,
      imagenUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwJgAnhblnn27ELLpUfoQmbeti-wsO596tsl9X9DvqFcjmfJUGxP7qqxgerY5s-rTgg91JMbNyNE4i63mJxIAyxNhYkp8wkT0X2iE4Vexhhjgmpwh9ropnWY_QqLNponG0enSkF--e3k2lI1f0pzbq0wly39F5he0G7bbjVV1Q5RV_agJcju9C-bHhf-7hhMXNahBS2Hzpy6KyoPnBKcQ2imGoA9qwbNac83letVDT',
      tipoProductoId: tipo2.id,
      marcaId: marca2.id,
      stock: 25,
      activo: true,
    },
  });

  const producto3 = await prisma.producto.upsert({
    where: { id: 3 },
    update: {},
    create: {
      nombre: 'Monitor Dell UltraSharp 27" 4K USB-C Hub U2723QE IPS Black',
      descripcion: 'Monitor profesional IPS Black 4K con USB-C Hub',
      precio: 1150000,
      imagenUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCGq8PqTCRpHqMZi5UQ8VmBWnTHn6at5tkz3FyMC1vbN3BjDnp0xlh6xZVlYi6H_ndZf8HHQmH6h80J1SF9e_QWRzHvM6nhSGjKwZvMXrTD7T7V5BieBqZJYYzEoHdIO-KHUseFxgx_cfhTyaDHJeUw27YuaAvWIpaxUfCjSmJFIYwzNaNMD1dvyUnp-TA-CPfQo_-HB-O8TVufHNjUinc-QJrfSMKv_4QqZ5NUoW1d',
      tipoProductoId: tipo3.id,
      marcaId: marca1.id,
      stock: 15,
      activo: true,
    },
  });

  const producto4 = await prisma.producto.upsert({
    where: { id: 4 },
    update: {},
    create: {
      nombre: 'GPU NVIDIA GeForce RTX 4070 Ti Super 16GB ASUS ProArt',
      descripcion: 'Placa de video profesional para creators',
      precio: 1620000,
      imagenUrl: 'https://example.com/rtx4070ti.jpg',
      tipoProductoId: tipo4.id,
      marcaId: marca3.id,
      stock: 8,
      activo: true,
    },
  });

  console.log('Seed completado exitosamente!');
  console.log('Productos creados:', { producto1, producto2, producto3, producto4 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
