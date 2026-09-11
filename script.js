         const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const productsContainer = document.getElementById('products-container');
function rendercarcard(car, position = 'beforeend') {
    if(document.getElementById(`car-${car.id}`)) return
    const phonenumber = '0934129016'
    const whatsappmessage = encodeURIComponent(`مرحبًا، أنا مهتم بالسيارة "${car.name}" التي رأيتها على موقعكم. هل يمكنني الحصول على مزيد من التفاصيل؟`);
     const carCard = `
        <div class="car-card" id="car-${car.id}">
        <img src="${car.image_url}" alt="${car.name}" style="width: 250px; height: auto;"/>
            <h3>${car.name}</h3>
            <p>كرت:${car.year}</p>
            <p>الحالة: ${car.status}</p>
            <p>${car.description}</p>
         <p>السعر: ${car.price} </p>
         <a href="https://wa.me/${phonenumber}?text=${whatsappmessage}" target="_blank">
            <button class="add-btn">اطلب الان</button>
         </a>
        </div>
        `;
        productsContainer.insertAdjacentHTML(position, carCard);

}
async function fetchcars (){
    const { data: cars, error } = await supabaseclient.from('cars').select('*').order('name', { ascending: false });
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
const searchInput = document.getElementById('search-input');
if (searchInput) {
    searchInput.addEventListener('input', function () {
const query = searchInput.value.trim().toLowerCase();
const carCards = document.querySelectorAll('.car-card');
carCards.forEach(card => {
    const carName = card.querySelector('h3').textContent.toLowerCase();
    if (carName.includes(query)) {
        card.style.display = '';
    } else {
        card.style.display = 'none';
    }
});
    })
}

