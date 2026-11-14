import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const projectRoot = path.resolve(import.meta.dirname, "../..");
dotenv.config({ path: path.join(projectRoot, "back", ".env") });

const imagesDir = path.join(projectRoot, "front", "public", "images", "productos");

// Curated high quality tech hardware images
const productImages: Record<number, { filename: string; fallbackExisting?: string; url: string }> = {
  1: {
    filename: "thinkpadx1.jpg",
    url: "", // already exists
  },
  2: {
    filename: "asus-proart-p16.jpg",
    url: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&auto=format&fit=crop&q=80",
  },
  3: {
    filename: "dell-xps-15.jpg",
    url: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
  },
  4: {
    filename: "dell-ultrasharp-27.jpg",
    url: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80",
  },
  5: {
    filename: "samsung-odyssey-g3.jpg",
    fallbackExisting: "samsung-odyssey-g5.jpg",
    url: "https://images.unsplash.com/photo-1547119957-637f8679db1e?w=800&auto=format&fit=crop&q=80",
  },
  6: {
    filename: "lg-29-ultrawide.jpg",
    url: "https://images.unsplash.com/photo-1585792180666-f7547c6a28c5?w=800&auto=format&fit=crop&q=80",
  },
  7: {
    filename: "keychron-q1-pro.jpg",
    url: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80",
  },
  8: {
    filename: "redragon-kumara.jpg",
    url: "", // already exists
  },
  9: {
    filename: "logitech-mx-mechanical.jpg",
    url: "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?w=800&auto=format&fit=crop&q=80",
  },
  10: {
    filename: "logitech-mx-master-3s.jpg",
    url: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&auto=format&fit=crop&q=80",
  },
  11: {
    filename: "redragon-griffin-m908.jpg",
    fallbackExisting: "logitech-g502.jpg",
    url: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=800&auto=format&fit=crop&q=80",
  },
  12: {
    filename: "razer-deathadder-v3.jpg",
    url: "https://images.unsplash.com/photo-1626958390898-162d3577f293?w=800&auto=format&fit=crop&q=80",
  },
  13: {
    filename: "rtx-4070-ti-super.jpg",
    url: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=800&auto=format&fit=crop&q=80",
  },
  14: {
    filename: "rtx-4060.jpg",
    url: "", // already exists
  },
  15: {
    filename: "rx-7800-xt.jpg",
    url: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800&auto=format&fit=crop&q=80",
  },
  16: {
    filename: "kingston-kc3000.jpg",
    fallbackExisting: "kingston-nv2.jpg",
    url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
  },
  17: {
    filename: "wd-black-sn850x.jpg",
    url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
  },
  18: {
    filename: "crucial-p3.jpg",
    fallbackExisting: "kingston-nv2.jpg",
    url: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=800&auto=format&fit=crop&q=80",
  },
  19: {
    filename: "cable-displayport-dell.jpg",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  },
  20: {
    filename: "cable-hdmi-lenovo.jpg",
    url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
  },
  21: {
    filename: "cable-usbc-samsung.jpg",
    url: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80",
  },
  22: {
    filename: "cable-ethernet-asus.jpg",
    url: "https://images.unsplash.com/photo-1551703599-6b3e8379aa8b?w=800&auto=format&fit=crop&q=80",
  },
  23: {
    filename: "cable-usba-usbc-genius.jpg",
    url: "https://images.unsplash.com/photo-1606778303355-662d12b95b7d?w=800&auto=format&fit=crop&q=80",
  },
  24: {
    filename: "kit-cables-corsair.jpg",
    url: "https://images.unsplash.com/photo-1591488320449-011701bb6704?w=800&auto=format&fit=crop&q=80",
  },
  25: {
    filename: "adaptador-usbc-dell.jpg",
    url: "https://images.unsplash.com/photo-1625842268584-8f3296236761?w=800&auto=format&fit=crop&q=80",
  },
  26: {
    filename: "adaptador-usbc-lenovo.jpg",
    url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80",
  },
  27: {
    filename: "hub-kingston-nucleum.jpg",
    url: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80",
  },
  28: {
    filename: "lector-sd-kingston.jpg",
    url: "https://images.unsplash.com/photo-1563770660941-20978e870e26?w=800&auto=format&fit=crop&q=80",
  },
  29: {
    filename: "adaptador-wifi-asus.jpg",
    url: "https://images.unsplash.com/photo-1616401784845-180882ba9ba8?w=800&auto=format&fit=crop&q=80",
  },
  30: {
    filename: "adaptador-xbox-windows.jpg",
    url: "https://images.unsplash.com/photo-1600080972464-8e5f35f63d08?w=800&auto=format&fit=crop&q=80",
  },
};

async function downloadFile(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Error al descargar ${url}: ${res.statusText}`);
      return false;
    }
    const arrayBuffer = await res.arrayBuffer();
    fs.writeFileSync(destPath, Buffer.from(arrayBuffer));
    return true;
  } catch (err) {
    console.error(`Fallo descargando ${url}:`, err);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const { prisma } = await import("../src/prisma.config.js");

  for (const [idStr, info] of Object.entries(productImages)) {
    const id = Number(idStr);
    const targetFile = path.join(imagesDir, info.filename);

    if (!fs.existsSync(targetFile)) {
      if (info.fallbackExisting && fs.existsSync(path.join(imagesDir, info.fallbackExisting))) {
        fs.copyFileSync(path.join(imagesDir, info.fallbackExisting), targetFile);
        console.log(`[${id}] Copiado desde fallback existente: ${info.fallbackExisting} -> ${info.filename}`);
      } else if (info.url) {
        console.log(`[${id}] Descargando ${info.filename}...`);
        const ok = await downloadFile(info.url, targetFile);
        if (!ok && info.fallbackExisting && fs.existsSync(path.join(imagesDir, info.fallbackExisting))) {
          fs.copyFileSync(path.join(imagesDir, info.fallbackExisting), targetFile);
        }
      }
    } else {
      console.log(`[${id}] Archivo ya existe: ${info.filename}`);
    }

    const relativeUrl = `images/productos/${info.filename}`;
    await prisma.producto.update({
      where: { id },
      data: { imagenUrl: relativeUrl },
    });
    console.log(`[${id}] DB actualizada con imagenUrl: ${relativeUrl}`);
  }

  const totalConImagen = await prisma.producto.count({
    where: { imagenUrl: { not: null } }
  });
  console.log(`\n¡Listo! Total de productos con imagen en DB: ${totalConImagen}/30`);

  await prisma.$disconnect();
}

main().catch(console.error);

