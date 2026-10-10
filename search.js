const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let counter1 = document.getElementById('counter1')
let counter2 = document.getElementById('counter2')
document.getElementById('price-range').addEventListener('input', function () {
counter1.textContent = this.value + "$"
})
document.getElementById('year-range').addEventListener('input', function () {
  counter2.textContent = this.value
})

function searchfilter() {
    const model = document.getElementById('model').value;
    const price = document.getElementById('price-range').value;
    const year = document.getElementById('year-range').value;
    let url = "index.html?"
    if (model !== ''){
        url += "model=" + encodeURIComponent(model) + "&"
    }
    if(price !== "0"){
  url += "price=" + price + "&"
    }
  if(year !== "1990"){
    url += "year=" + year
  }
    window.location.href = url
}