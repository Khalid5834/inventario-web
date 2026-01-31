// 🔹 SUPABASE CONFIG
const supabase = supabase.createClient(
  "TU_SUPABASE_URL",
  "TU_SUPABASE_ANON_KEY"
);

const tableBody = document.getElementById("productTable");
const csvInput = document.getElementById("csvInput");

// 🔹 REDONDEO SOLO EN IMPORTACIÓN
function redondearPrecio(valor) {
  const resto = valor % 10;
  if (resto <= 4) return valor - resto;
  return valor + (10 - resto);
}

// 🔹 CARGAR CSV
csvInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  const text = await file.text();
  const rows = text.split("\n");

  for (let i = 1; i < rows.length; i++) {
    const cols = rows[i].split(",");

    if (!cols[0] || !cols[6]) continue;

    const name = cols[0].trim();
    let price = parseFloat(cols[6]);

    price = redondearPrecio(price);

    // UPSERT (actualiza si existe, crea si no)
    await supabase.from("products").upsert({
      name,
      price
    }, { onConflict: "name" });
  }

  cargarProductos();
});

// 🔹 MOSTRAR PRODUCTOS
async function cargarProductos() {
  tableBody.innerHTML = "";

  const { data } = await supabase.from("products").select("*");

  data.forEach(prod => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td><input type="text" value="${prod.name}"></td>
      <td><input type="number" value="${prod.price}"></td>
      <td><button>Guardar</button></td>
    `;

    tr.querySelector("button").onclick = async () => {
      const newName = tr.children[0].children[0].value;
      const newPrice = parseFloat(tr.children[1].children[0].value);

      await supabase.from("products").update({
        name: newName,
        price: newPrice,
        updated_at: new Date()
      }).eq("id", prod.id);

      alert("Guardado");
    };

    tableBody.appendChild(tr);
  });
}

// 🔹 CARGA INICIAL
cargarProductos();
