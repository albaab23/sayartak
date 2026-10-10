const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
let cardetails = document.getElementById('cardetails-product')
async function rendercard(car, position = 'beforeend') {
    if(document.getElementById(`car-${car.id}`)) return
    const phonenumber = '0934129016'
    const whatsappmessage = encodeURIComponent(`مرحبًا، أنا مهتم بالسيارة "${car.name}" التي رأيتها على موقعكم. هل يمكنني الحصول على مزيد من التفاصيل؟`);
    const carCard = `
    <div class= "product-cart">
<div class="images">
  ${car.image_url.map(url => `<img src="${url}" alt="${car.name}"/>`).join('')}
</div>
<h4>${car.name}</h4>
<h2>${car.year}</h2>
<p>${car.status}</p>
<p>${car.description}</p>
<a href="https://wa.me/${phonenumber}?text=${whatsappmessage}" target="_blank" class="action-btn">
<button class="add-btn">اطلب الان</button>
    </a>
    </div>
    `
    cardetails.insertAdjacentHTML(position, carCard)
}
async function fetchcars() {
  const carid = new URLSearchParams(window.location.search).get('id')
  const {data: car, error} = await supabaseclient.from('cars').select('*').eq('id', carid)
  if (error) {
    console.error('Error fetching cars:', error);
    return;
}
cardetails.innerHTML = ''
cardetails.insertAdjacentHTML = rendercard(car[0])
  }
  supabaseclient.channel('public:cars').on('postgres_changes', { event: '*', schema: 'public', table: 'cars' }, (payload) => {
    if (payload.eventType === 'INSERT') {
        console.log('New car added:', payload.new);
        rendercard(payload.new, 'afterbegin');
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
