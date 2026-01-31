// 🔹 SUPABASE CONFIG
const supabaseClient = supabase.createClient(
  "https://xdxorvuumktgwaaqonsb.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhkeG9ydnV1bWt0Z3dhYXFvbnNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk4MTc0MzQsImV4cCI6MjA4NTM5MzQzNH0.uEW2_HPLOpT9J4N7OVhqkgOOAFDsj7Ktn4VxorFMh38"
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
    await supabaseClient.from("products").upsert({
      name,
      price
    }, { onConflict: "name" });
  }

  cargarProductos();
});

// 🔹 MOSTRAR PRODUCTOS
async function cargarProductos() {
  tableBody.innerHTML = "";

  const { data } = await supabaseClient.from("products").select("*");

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

      await supabaseCLient.from("products").update({
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
