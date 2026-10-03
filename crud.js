         const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
function compressimage(file, maxWidth = 1000, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1,maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        resolve(new File([blob], file.name, { type: 'image/jpeg' }));
      }, 'image/jpeg', quality);
    };
  });
}
 async function addproduct(){
let name = document.getElementById('name')
let year = document.getElementById('year')
let price = document.getElementById('price')
let desc = document.getElementById('desc')
let status = document.getElementById('status')
let img = document.getElementById('img')
let imgFile = img.files[0];
if(!imgFile){
  alert('الرجاء اختيار صورة للمنتج');
  return;
}
let imgFiles = Array.from(img.files);
if (imgFiles.length === 0) {
  alert('الرجاء اختيار صورة واحدة على الأقل للمنتج');
  return;
}
let uploadedImageUrls = [];
for (let i = 0; i < imgFiles.length; i++) {
  let imgFileX = await compressimage(imgFiles[i]);
  let filename = Date.now() + '_' + i + '_' + imgFileX.name;
  console.log('Uploading image with filename:', filename);
  const { data: uploadData, error: uploadError } = await supabaseclient.storage.from('car-images').upload(filename, imgFileX);
  if (uploadError) {
    console.error('Error uploading image:', uploadError);
    alert('حدث خطأ أثناء رفع الصورة: ' + (uploadError.message || JSON.stringify(uploadError)));
    return;
  }
  const { data: urlData } = supabaseclient.storage.from('car-images').getPublicUrl(filename);
  uploadedImageUrls.push(urlData.publicUrl);
}
 const { data: insertData, error: insertError } = await supabaseclient.from('cars').insert([
   {
     name: name.value,
     year: Number(year.value),
     price: Number(price.value),
     description: desc.value,
     status: status.value,
     image_url: uploadedImageUrls
   }
 ]).select();


 if (insertError) {
   console.error('Error inserting car:');
   console.error(insertError);
   alert('حدث خطأ أثناء إضافة المنتج' + insertError.message || JSON.stringify(insertError));
   return;
 }

name.value = ''
year.value = ''
price.value = ''
desc.value = ''
status.value = ''
img.value = ''
}
const productsContainer = document.getElementById('crud-products-container');
async function deleteproduct(id){
  const confirmDelete = confirm(`هل أنت متأكد أنك تريد حذف المنتج `);
  if (!confirmDelete) {
    return;
  }
  const {data, error} = await supabaseclient.from('cars').delete().eq('id', id);
  if (error) {
    console.error('Error deleting car:', error);
    alert('حدث خطأ أثناء حذف المنتج' + error.message || JSON.stringify(error));
    return;
  }

}

function rendercarcard(car, position = 'beforeend') {
    if(document.getElementById(`car-${car.id}`)) return
     const carCard = `
        <div class="car-card" id="car-${car.id}">
        <div class="cloumn">
        <div class="car-images">
        ${car.image_url.map(url => `<img src="${url}" alt="${car.name}" style="width: 250px; height: auto;"/>`).join('')}
        </div>
            <h3>${car.name}</h3>
            <p>سنة الصنع: ${car.year}</p>
            <p>الحالة: ${car.status}</p>
            <p>${car.description}</p>
         <p>السعر: ${car.price} </p>
         <button onclick="deleteproduct('${car.id}')" class="delete-btn">حذف</button>
         </div>
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
const inputSearch = document.getElementById('search-input');
if (inputSearch) {
    inputSearch.addEventListener('input', function () {
const query = inputSearch.value.trim().toLowerCase();
const carCards = document.querySelectorAll('.car-card');
carCards.forEach(card => {
    const carName = card.querySelector('h3').textContent.toLowerCase();
    if (carName.includes(query)) {
        card.style.display = '';
    } else {
        card.style.display = 'none';
    }
  })
})
}