         const SUPABASE_URL = "https://jyibiwhfbidwynraokru.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_GjdN315AEBfXfNGfdO5XiA_HYdFiHmU"
const supabaseclient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
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
let filename = Date.now() + '_' + imgFile.name;
console.log('Uploading image with filename:', filename);
const {data: uploadData, error: uploadError} = await supabaseclient.storage.from('car-images').upload(filename, imgFile);
if (uploadError) {
  console.error('Error uploading image:');
  console.error(uploadError);
  alert('حدث خطأ أثناء رفع الصورة' + uploadError.message || JSON.stringify(uploadError));
  return;
}
console.log('Image uploaded successfully:', uploadData);
const { data: urlData } = supabaseclient.storage.from('car-images').getPublicUrl(filename);
 let imgurl = urlData.publicUrl;
 console.log('Public URL of the uploaded image:', imgurl);
 const { data: insertData, error: insertError } = await supabaseclient.from('cars').insert([
   {
     name: name.value,
     year: Number(year.value),
     price: Number(price.value),
     description: desc.value,
     status: status.value,
     image_url: imgurl
   }
 ]);


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
async function deleteproduct(name){
  const confirmDelete = confirm(`هل أنت متأكد أنك تريد حذف المنتج "${name}"؟`);
  if (!confirmDelete) {
    return;
  }
  const {error} = await supabaseclient.from('cars').delete().eq('name', name);
  if (error) {
    console.error('Error deleting car:', error);
    alert('حدث خطأ أثناء حذف المنتج' + error.message || JSON.stringify(error));
    return;
  }
}
function rendercarcard(car, position = 'beforeend') {
    if(document.getElementById(`car-${car.name}`)) return
     const carCard = `
        <div class="car-card" id="car-${car.name}">
        <div class="cloumn">
        <img src="${car.image_url}" alt="${car.name}" style="width: 250px; height: auto;"/>
            <h3>${car.name}</h3>
            <p>سنة الصنع: ${car.year}</p>
            <p>الحالة: ${car.status}</p>
            <p>${car.description}</p>
         <p>السعر: ${car.price} </p>
         <button onclick="deleteproduct('${car.name}')">حذف</button>
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
    const deletedcar = document.getElementById(`car-${payload.old.name}`);
    if (deletedcar) {
        deletedcar.remove();
    }
}
})
.subscribe();
fetchcars();