         const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const productsContainer = document.getElementById('products-container');
function rendercarcard(car, position = 'beforeend') {
    if(document.getElementById(`car-${car.id}`)) return
     const carCard = `
     <a href="cardetails.html?id=${car.id}" class="link"> 
        <div class="car-card" id="car-${car.id}">
        <div class="car-images">
            ${car.image_url.map(url => `<img src="${url}" alt="${car.name}" style="width: 250px; height: auto;"/>`).join('')}
        </div>
        <div class="details">
            <h3>${car.name}</h3>
         <p>السعر: ${car.price} </p>
         </div>
        </div>
        </a>
        `;
        productsContainer.insertAdjacentHTML(position, carCard);

}
async function fetchcars (){
let params = new URLSearchParams(window.location.search);
let modelFilter = params.get('model');
let priceFilter = params.get('price');
let yearFilter = params.get('year');
let query = supabaseclient.from('cars').select('*');
if (modelFilter) {
    query = query.ilike('name', '%' + modelFilter + '%');
}
if (priceFilter) {
    query = query.lte('price', Number(priceFilter));
}
if (yearFilter) {
    query = query.gte('year', Number(yearFilter));
}

const { data: cars, error } = await query.order('name', { ascending: false });

    if (error) {
        console.error('Error fetching cars:', error);
        return;
    }
    productsContainer.innerHTML = '';
    cars.forEach(car => {
rendercarcard(car, 'beforeend');
    });
}

supabaseclient.channel('public:cars').on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, (payload) => {
if (payload.eventType === 'INSERT') {
    console.log('New car added:', payload.new);
    rendercarcard(payload.new, 'afterbegin');
}else if (payload.eventType === 'DELETE') {
    console.log('Car deleted:', payload.old);
    const deletedcar = document.getElementById(`car-${payload.old.id}`);
    if (deletedcar) {
        deletedcar.remove();
    }
}
})
.subscribe();
fetchcars();
