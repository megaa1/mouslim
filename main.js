
modalContainer = document.getElementById("modal-container");
if (modalContainer) {
    window.onload = (event) => {
        modalContainer.classList.add('show-modal');
    };
}
  
/*=============== CLOSE MODAL ===============*/
const closeBtn = document.querySelectorAll('.close-modal');

function closeModal(){
    const modalContainer = document.getElementById('modal-container')
    if (modalContainer) {
        modalContainer.classList.remove('show-modal')
    }
}
if (closeBtn.length > 0) {
    closeBtn.forEach(c => c.addEventListener('click', closeModal))
}


// Selecting DOM Elements
const arabicAyah = document.querySelector('.arabic-ayah')
const suraNumber = document.querySelector('.sura-number')
const audio = document.querySelector('audio')
const btnPlay = document.querySelector('.btn-play')
const generateBtn = document.querySelector('.btn-generate')
const suraName = document.querySelector('.sura-name')
const ayahNum = document.querySelector('.ayah-number')
const suraInfo = document.querySelector('.sura-info')


// Random Number
function generateRandomNum(){
    return Math.floor(Math.random() * 6236)
}
const randomNum = generateRandomNum()


// Fetching API
if (arabicAyah && suraName && ayahNum && audio) {
    const arabicApi = `https://api.alquran.cloud/v1/ayah/${randomNum}/ar.minshawi`

    const arabic = fetch(arabicApi)
                    .then(blob => blob.json())
                    .then(data => {
                        if (arabicAyah) arabicAyah.textContent = `${data.data.text}`
                        if (suraName) suraName.textContent = `${data.data.surah.name}`
                        if (ayahNum) ayahNum.textContent = `${data.data.numberInSurah}`
                        if (audio) audio.src = data.data.audio
                    })
                    .catch(error => console.error('Error fetching ayah:', error))
}

// Event Listener
if (btnPlay && audio) {
    btnPlay.addEventListener('click', () =>{
        audio.play()
    })
}
if (generateBtn) {
    generateBtn.addEventListener('click',()=>{
        location.reload()
    })
}




//Explore button 
let exploreBtn = document.querySelector('.btn-primary'),
    HadithSection = document.querySelector('.hadith');
if (exploreBtn && HadithSection) {
    exploreBtn.addEventListener('click',()=>{
        HadithSection.scrollIntoView({
            behavior : "smooth"
        })
    })
}
let fixedNav = document.querySelector('.header'),
     scrollBtn = document.querySelector('.scrollBtn');
if (fixedNav) {
    window.addEventListener("scroll",()=>{
        if (window.scrollY > 100) {
            fixedNav.classList.add('active');
        } else {
            fixedNav.classList.remove('active');
        }
        if (scrollBtn) {
            if (window.scrollY > 500) {
                scrollBtn.classList.add('active');
            } else {
                scrollBtn.classList.remove('active');
            }
        }
    })
}
if (scrollBtn) {
    scrollBtn.addEventListener('click',()=>{
        window.scrollTo({
            top : 0,
            behavior : "smooth"
        })
    })
}



//Active SideBar
let bars = document.querySelector('.bars'),
    SideBar = document.querySelector('.header ul');
if (bars && SideBar) {
    bars.addEventListener('click',()=>{
        SideBar.classList.toggle("active");
    })
}

//hadith
let currentPage = 1;
let totalHadith = 300; // يمكنك تعديل هذه القيمة حسب العدد الكلي للأحاديث

async function fetchHadith(book, page) {
    const hadithContainer = document.getElementById('hadith-container');
    
    if (!hadithContainer) {
        console.error('Hadith container not found');
        return;
    }
    
    // محاولة استخدام API البديل أولاً لأنه يدعم CORS بشكل أفضل
    try {
        await fetchHadithAlternative(book, page);
    } catch (altError) {
        console.log('Alternative API failed, trying CORS proxy:', altError);
        
        // إذا فشل API البديل، جرب CORS proxy
        try {
            const apiUrl = `https://hadis-api-id.vercel.app/hadith/${book}?page=${page}&limit=1`;
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(apiUrl)}`;
            
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            const proxyData = await response.json();
            
            // تحليل البيانات من CORS proxy
            let data;
            try {
                data = JSON.parse(proxyData.contents);
            } catch (e) {
                data = proxyData.contents;
            }
            
            hadithContainer.innerHTML = '';

            if (data.items && data.items.length > 0) {
                const hadith = data.items[0];
                const hadithElement = document.createElement('div');
                hadithElement.textContent = `${hadith.arab}`;
                hadithContainer.appendChild(hadithElement);

                const numElement = document.getElementById('num');
                if (numElement) {
                    numElement.textContent = `${hadith.number} / ${totalHadith}`;
                }
            } else if (data.data && data.data.length > 0) {
                const hadith = data.data[0];
                const hadithElement = document.createElement('div');
                hadithElement.textContent = `${hadith.arab || hadith.text}`;
                hadithContainer.appendChild(hadithElement);

                const numElement = document.getElementById('num');
                if (numElement) {
                    numElement.textContent = `${hadith.number || page} / ${totalHadith}`;
                }
            } else {
                hadithContainer.innerHTML = '<div>لا توجد أحاديث في هذا المصدر.</div>';
                const numElement = document.getElementById('num');
                if (numElement) {
                    numElement.textContent = '0 / 300';
                }
            }
        } catch (error) {
            console.error('CORS proxy also failed:', error);
            hadithContainer.innerHTML = '<div>حدث خطأ في تحميل الأحاديث. يرجى المحاولة مرة أخرى أو تحديث الصفحة.</div>';
        }
    }
}

// دالة بديلة لجلب الأحاديث من API آخر
async function fetchHadithAlternative(book, page) {
    const hadithContainer = document.getElementById('hadith-container');
    
    if (!hadithContainer) {
        throw new Error('Hadith container not found');
    }
    
    // خريطة أسماء الكتب من القيم المستخدمة في الموقع إلى أسماء API
    const bookMap = {
        'muslim': 'muslim',
        'bukhari': 'bukhari',
        'abu-dawud': 'abu-dawud',
        'ahmad': 'ahmad',
        'ibnu-majah': 'ibn-majah',
        'malik': 'malik',
        'nasai': 'nasai',
        'tirmidzi': 'tirmidzi',
        'darimi': 'darimi'
    };
    
    const apiBookName = bookMap[book] || book;
    
    // استخدام API آخر يدعم CORS بشكل أفضل
    const alternativeApi = `https://api.hadith.gading.dev/books/${apiBookName}?range=${page}-${page}`;
    
    const response = await fetch(alternativeApi, {
        mode: 'cors',
        headers: {
            'Accept': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.data && data.data.hadiths && data.data.hadiths.length > 0) {
        const hadith = data.data.hadiths[0];
        hadithContainer.innerHTML = '';
        
        const hadithElement = document.createElement('div');
        hadithElement.textContent = `${hadith.arab}`;
        hadithContainer.appendChild(hadithElement);
        
        const numElement = document.getElementById('num');
        if (numElement) {
            numElement.textContent = `${hadith.number} / ${totalHadith}`;
        }
    } else if (data.data && data.data.hadiths && data.data.hadiths.length === 0) {
        hadithContainer.innerHTML = '<div>لا توجد أحاديث في هذه الصفحة. جرب الصفحة التالية.</div>';
        const numElement = document.getElementById('num');
        if (numElement) {
            numElement.textContent = `0 / ${totalHadith}`;
        }
        throw new Error('No hadiths in this page');
    } else {
        hadithContainer.innerHTML = '<div>لا توجد أحاديث في هذا المصدر.</div>';
        throw new Error('Invalid API response');
    }
}

const nextBtnHadith = document.getElementById('next-btn');
if (nextBtnHadith) {
    nextBtnHadith.addEventListener('click', () => {
        currentPage++;
        const book = document.getElementById('book-select').value;
        fetchHadith(book, currentPage);
    });
}

const prevBtnHadith = document.getElementById('prev-btn');
if (prevBtnHadith) {
    prevBtnHadith.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            const book = document.getElementById('book-select').value;
            fetchHadith(book, currentPage);
        }
    });
}

const bookSelect = document.getElementById('book-select');
if (bookSelect) {
    bookSelect.addEventListener('change', () => {
        currentPage = 1; // إعادة تعيين الصفحة عند تغيير الكتاب
        const book = document.getElementById('book-select').value;
        fetchHadith(book, currentPage);
    });
}

// جلب الأحاديث عند تحميل الصفحة
fetchHadith('muslim', currentPage);
function getLocationByIP() {
    // استخدام موقع افتراضي مباشرة لتجنب مشاكل CORS
    // القاهرة كموقع افتراضي (يمكن تغييره حسب الحاجة)
    const defaultLatitude = 30.0444;
    const defaultLongitude = 31.2357;
    
    // محاولة جلب الموقع فقط إذا كان الموقع يعمل من HTTP server
    // إذا كان يعمل من file://، استخدم الموقع الافتراضي مباشرة
    if (window.location.protocol === 'file:') {
        // الموقع يعمل من ملف محلي، استخدم الموقع الافتراضي
        getPrayerTimes(defaultLatitude, defaultLongitude);
        return;
    }
    
    // محاولة جلب الموقع من API يدعم CORS
    // استخدام API بديل يدعم CORS بشكل أفضل
    fetch('https://ipapi.co/json/', {
        mode: 'cors',
        headers: {
            'Accept': 'application/json'
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.latitude && data.longitude) {
                const latitude = data.latitude;
                const longitude = data.longitude;
                // استدعاء مواقيت الصلاة باستخدام الإحداثيات
                getPrayerTimes(latitude, longitude);
            } else {
                // في حالة فشل جلب الموقع، استخدام القاهرة كموقع افتراضي
                getPrayerTimes(defaultLatitude, defaultLongitude);
            }
        })
        .catch(error => {
            // في حالة فشل جلب الموقع، استخدام القاهرة كموقع افتراضي
            getPrayerTimes(defaultLatitude, defaultLongitude);
        });
}

function getPrayerTimes(latitude, longitude) {
    // الحصول على التاريخ الحالي
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // استخدم API مجاني للحصول على مواقيت الصلاة
    fetch(`https://api.aladhan.com/v1/timings/${day}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=2`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.data && data.data.timings) {
                const times = data.data.timings;

                // التحقق من وجود العناصر قبل عرض مواقيت الصلاة
                const fajrEl = document.getElementById('fajr');
                const dhuhrEl = document.getElementById('dhuhr');
                const asrEl = document.getElementById('asr');
                const maghribEl = document.getElementById('maghrib');
                const ishaEl = document.getElementById('isha');

                if (fajrEl && times.Fajr) {
                    fajrEl.textContent = convertTo12HourFormat(times.Fajr);
                }
                if (dhuhrEl && times.Dhuhr) {
                    dhuhrEl.textContent = convertTo12HourFormat(times.Dhuhr);
                }
                if (asrEl && times.Asr) {
                    asrEl.textContent = convertTo12HourFormat(times.Asr);
                }
                if (maghribEl && times.Maghrib) {
                    maghribEl.textContent = convertTo12HourFormat(times.Maghrib);
                }
                if (ishaEl && times.Isha) {
                    ishaEl.textContent = convertTo12HourFormat(times.Isha);
                }

                const prayerTimesEl = document.getElementById('prayerTimes');
                if (prayerTimesEl) {
                    prayerTimesEl.style.display = 'block';
                }
            } else {
                console.error('Invalid API response:', data);
            }
        })
        .catch(error => {
            console.error('Error fetching prayer times:', error);
            // في حالة فشل جلب المواقيت، عرض رسالة خطأ
            const fajrEl = document.getElementById('fajr');
            if (fajrEl) {
                fajrEl.textContent = 'خطأ في التحميل';
            }
        });
}

function convertTo12HourFormat(time) {
    if (!time || typeof time !== 'string') {
        return '0:00';
    }
    
    try {
        let [hours, minutes] = time.split(':');
        if (!hours || !minutes) {
            return '0:00';
        }
        
        hours = parseInt(hours);
        minutes = parseInt(minutes);
        
        if (isNaN(hours) || isNaN(minutes)) {
            return '0:00';
        }
        
        const ampm = hours >= 12 ? 'مساءً' : 'صباحا';
        hours = hours % 12 || 12; // تحويل إلى صيغة 12 ساعة
        
        // التأكد من أن الدقائق تتكون من رقمين
        minutes = minutes.toString().padStart(2, '0');
        
        return hours + ':' + minutes + ' ' + ampm;
    } catch (error) {
        console.error('Error converting time:', error);
        return '0:00';
    }
}

// استدعاء الوظيفة لتحديد الموقع وعرض أوقات الصلاة
getLocationByIP();



let currentStationIndex = 0;
let stations = [];
let isPlaying = false;
const radioStream = new Audio();
const playBtn = document.getElementById('playBtn');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const statusText = document.getElementById('status');
const radioName = document.getElementById('radioName');
const radioImage = document.getElementById('radioImage');

// Fetch stations from API
fetch('https://data-rosy.vercel.app/radio.json')
  .then(response => response.json())
  .then(data => {
    stations = data.radios;
    loadStation(currentStationIndex); // Load the first station
  })
  .catch(error => console.error('Error fetching radio stations:', error));

// Load radio station details
function loadStation(index) {
  const station = stations[index];
  if (radioStream) radioStream.src = station.url;
  if (radioName) radioName.innerHTML = station.name;
  if (radioImage) radioImage.src = station.img;
  if (statusText) statusText.textContent = 'قيد التوقف';
  if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
  isPlaying = false;
}

// Play/Pause functionality
if (playBtn && statusText) {
    playBtn.addEventListener('click', function() {
        if (isPlaying) {
            radioStream.pause();
            playBtn.innerHTML = '<i class="fas fa-play"></i>';
            statusText.textContent = 'قيد التوقف';
        } else {
            radioStream.play();
            playBtn.innerHTML = '<i class="fas fa-pause"></i>';
            statusText.textContent = 'قيد التشغيل';
        }
        isPlaying = !isPlaying;
    });
}

// Navigate to the previous station
if (prevBtn && statusText) {
    prevBtn.addEventListener('click', function() {
        if (currentStationIndex > 0) {
            currentStationIndex--;
            loadStation(currentStationIndex);
            if (isPlaying) {
                radioStream.play();
                statusText.textContent = 'قيد التشغيل';
            }
        }
    });
}

// Navigate to the next station
if (nextBtn && statusText) {
    nextBtn.addEventListener('click', function() {
        if (currentStationIndex < stations.length - 1) {
            currentStationIndex++;
            loadStation(currentStationIndex);
            if (isPlaying) {
                radioStream.play();
                statusText.textContent = 'قيد التشغيل';
            }
        }
    });
}

// المحاضرات


let currentLecturePage = 1; // رقم الصفحة الحالية
const itemsPerPage = 25; // عدد العناصر في كل صفحة
const mainLectureListElement = document.getElementById("mainLectureList");
const subLectureListElement = document.getElementById("subLectureList");
const videoPlayerElement = document.getElementById("videoPlayer");
const videoDescriptionElement = document.getElementById("videoDescription");
const searchBox = document.getElementById("searchBox"); // صندوق البحث (قد لا يكون موجودًا في الصفحة الرئيسية)
const baseApiUrl = "https://api3.islamhouse.com/v3/paV29H2gm56kvLPy/main/videos/ar/ar/";

let totalPages = 36; // عدد الصفحات الإجمالي
let searchTerm = ''; // تخزين كلمة البحث

// جلب المحاضرات لصفحة معينة
function fetchLectures(page, query = '') {
    let apiUrl = `${baseApiUrl}${page}/${itemsPerPage}/json`;
    if (query) {
        apiUrl = `${baseApiUrl}search/${query}/${page}/${itemsPerPage}/json`; // تعديل الرابط للبحث
    }
    
    return fetch(apiUrl)
        .then(response => response.json())
        .then(data => data.data || [])
        .catch(error => console.error('Error fetching lectures:', error));
}

// جلب جميع نتائج البحث من كل الصفحات
async function fetchAllSearchResults(query) {
    let allLectures = [];
    let page = 1;
    let lectures = [];
    
    // التكرار عبر الصفحات لجلب جميع النتائج
    do {
        lectures = await fetchLectures(page, query);
        allLectures = allLectures.concat(lectures); // دمج المحاضرات
        page++; // الانتقال إلى الصفحة التالية
    } while (lectures.length === itemsPerPage); // الاستمرار إذا كانت الصفحة ممتلئة
    
    return allLectures;
}

// عرض المحاضرات الرئيسية مع الاحتفاظ بالمحاضرات السابقة
function displayMainLectures(lectures, append = false) {
    if (!append) {
        mainLectureListElement.innerHTML = ''; // مسح قائمة المحاضرات السابقة
    }
    
    if (lectures.length === 0 && !append) {
        mainLectureListElement.innerHTML = '<li>لم يتم العثور على نتائج</li>'; // إذا لم يتم العثور على محاضرات
        return;
    }
    
    lectures.forEach(item => {
        const listItem = document.createElement("li");
        listItem.textContent = item.title;
        listItem.style.cursor = "pointer";

        listItem.onclick = function () {
            displaySubLectures(item.attachments);

            if (item.attachments && item.attachments.length > 0) {
                playSubLecture(item.attachments[0]);
            }

            if (window.innerWidth <= 380) {
                videoPlayerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };

        mainLectureListElement.appendChild(listItem);
    });

    // إظهار زر "إظهار المزيد" إذا كانت هناك صفحات إضافية
    if (currentLecturePage < totalPages) {
        document.getElementById('loadMoreButton').classList.remove('hidden');
    } else {
        document.getElementById('loadMoreButton').classList.add('hidden');
    }
}

// تشغيل المحاضرة الفرعية المحددة
function playSubLecture(subItem) {
    videoPlayerElement.src = subItem.url; // تشغيل الفيديو
    videoPlayerElement.autoplay = true;
    videoDescriptionElement.textContent = subItem.description;

    if (window.innerWidth <= 380) {
        videoPlayerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// عرض المحاضرات الفرعية
function displaySubLectures(attachments) {
    subLectureListElement.innerHTML = ''; // مسح المحاضرات الفرعية السابقة
    attachments.forEach(subItem => {
        const subListItem = document.createElement("li");
        subListItem.textContent = subItem.description;
        subListItem.style.cursor = "pointer";
        subListItem.onclick = () => {
            playSubLecture(subItem);

            if (window.innerWidth <= 380) {
                videoPlayerElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        };
        subLectureListElement.appendChild(subListItem);
    });

    if (attachments.length === 0) {
        subLectureListElement.innerHTML = '<li>لا توجد محاضرات فرعية متاحة.</li>';
    }
}



// تحميل المحاضرات الافتراضية عند فتح الصفحة
function loadLectures(page, query = '') {
    currentLecturePage = page; // تحديث رقم الصفحة الحالية
    mainLectureListElement.innerHTML = '';
    fetchLectures(page, query).then(lectures => {
        displayMainLectures(lectures);
    });
}


// تحميل المحاضرات عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    loadLectures(currentLecturePage);
});



function toggleSubLectureList() {
    const subLectureList = document.getElementById('subLectureList');
    const dropdownArrow = document.getElementById('dropdownArrow');
    
    subLectureList.classList.toggle('hidden');

    if (subLectureList.classList.contains('hidden')) {
        dropdownArrow.innerHTML = '&#9662;'; // سهم لأسفل
    } else {
        dropdownArrow.innerHTML = '&#9652;'; // سهم لأعلى
    }
}
