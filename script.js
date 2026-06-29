// المتغيرات العامة لإدارة الواجهة والسلايدر
let currentSlide = 0;
const slidesRow = document.getElementById('slide-row');
const slideNum = document.getElementById('slide-num');

// 📞 رقم الواتساب الذي سيتم تحويل الطلبات عليه تلقائياً
const WHATSAPP_NUMBER = "201069086119";

function moveSlide(direction) {
    currentSlide += direction;
    if (currentSlide > 1) currentSlide = 0;
    if (currentSlide < 0) currentSlide = 1;
    
    if (slidesRow) {
        slidesRow.style.transform = `translateX(${currentSlide * 50}%)`;
    }
    if (slideNum) {
        slideNum.innerText = `2 / ${currentSlide + 1}`;
    }
}

function scrollToCheckout() {
    const checkoutSec = document.getElementById('checkout-section');
    if (checkoutSec) {
        checkoutSec.scrollIntoView({ behavior: 'smooth' });
    }
}

// إدارة العروض والكميات والـ Slots الديناميكية
let currentOfferMode = 'single'; 
let currentQuantity = 2; 

function setOfferType(mode) {
    currentOfferMode = mode;
    const counterBox = document.getElementById('counter-box');
    
    if(mode === 'single') {
        const radioSingle = document.getElementById('radio-single');
        if (radioSingle) radioSingle.checked = true;
        if (counterBox) counterBox.style.display = 'none';
        renderSlots(1);
    } else {
        const radioMulti = document.getElementById('radio-multi');
        if (radioMulti) radioMulti.checked = true;
        if (counterBox) counterBox.style.display = 'flex';
        renderSlots(currentQuantity);
    }
}

function changeQuantity(change) {
    currentQuantity += change;
    if(currentQuantity < 2) currentQuantity = 2; 
    
    const qtyVal = document.getElementById('qty-val');
    if (qtyVal) qtyVal.innerText = currentQuantity;
    
    renderSlots(currentQuantity);
}

function renderSlots(count) {
    const container = document.getElementById('dynamic-slots-container');
    if (!container) return;

    const savedSelections = [];
    for(let i = 1; i <= 10; i++) {
        const slotColor = document.getElementById(`color-val-${i}`);
        const slotSize = document.getElementById(`size-val-${i}`);
        if(slotColor && slotSize) {
            savedSelections.push({ color: slotColor.value, size: slotSize.value });
        }
    }

    container.innerHTML = '';

    for(let i = 1; i <= count; i++) {
        let defaultColor = (savedSelections[i-1]) ? savedSelections[i-1].color : 'اسود';
        let defaultSize = (savedSelections[i-1]) ? savedSelections[i-1].size : '✔️ L';

        const slotHtml = `
            <div class="dynamic-slot" id="slot-item-${i}">
                <div class="slot-title">القطعة رقم ${i}</div>
                
                <input type="hidden" id="color-val-${i}" value="${defaultColor}">
                <input type="hidden" id="size-val-${i}" value="${defaultSize}">

                <div class="selection-instruction">يرجى اختيار اللون:</div>
                <div class="current-info-text" id="color-label-${i}">اللون الحالي: ${defaultColor}</div>
                
                <div class="image-selector-grid">
                    <div class="color-img-option ${defaultColor === 'اسود' ? 'active' : ''}" id="img-black-${i}" onclick="selectSlotColor(${i}, 'اسود')">
                        <img src="1.jpg" alt="أسود">
                    </div>
                    <div class="color-img-option ${defaultColor === 'أوف وايت' || defaultColor === 'ابيض' ? 'active' : ''}" id="img-white-${i}" onclick="selectSlotColor(${i}, 'أوف وايت')">
                        <img src="2.jpg" alt="أوف وايت">
                    </div>
                </div>

                <div class="selection-instruction">يرجى اختيار المقاس بناءً على وزنك:</div>
                <div class="current-info-text" id="size-label-${i}">المقاس الحالي: ${defaultSize}</div>
                
                <div class="size-buttons-container" id="size-container-${i}">
                    <button type="button" class="size-pill-btn ${defaultSize === '✔️ L' ? 'active' : ''}" onclick="selectSlotSize(${i}, '✔️ L', this)">
                        ✔️ L: من 55 لـ 70 كجم
                    </button>
                    <button type="button" class="size-pill-btn ${defaultSize === '✔️ XL' ? 'active' : ''}" onclick="selectSlotSize(${i}, '✔️ XL', this)">
                        ✔️ XL: من 70 لـ 80 كجم
                    </button>
                    <button type="button" class="size-pill-btn ${defaultSize === '✔️ 2XL' ? 'active' : ''}" onclick="selectSlotSize(${i}, '✔️ 2XL', this)">
                        ✔️ 2XL: من 80 لـ 95 كجم
                    </button>
                </div>
            </div>
        `;
        container.insertAdjacentHTML('beforeend', slotHtml);
    }
    calculateTotal();
}

function selectSlotColor(slotIndex, colorName) {
    document.getElementById(`color-val-${slotIndex}`).value = colorName;
    document.getElementById(`color-label-${slotIndex}`).innerText = "اللون الحالي: " + colorName;
    
    document.getElementById(`img-black-${slotIndex}`).classList.remove('active');
    document.getElementById(`img-white-${slotIndex}`).classList.remove('active');
    
    if(colorName === 'اسود') {
        document.getElementById(`img-black-${slotIndex}`).classList.add('active');
    } else {
        document.getElementById(`img-white-${slotIndex}`).classList.add('active');
    }
    calculateTotal();
}

function selectSlotSize(slotIndex, sizeText, clickedButton) {
    document.getElementById(`size-val-${slotIndex}`).value = sizeText;
    document.getElementById(`size-label-${slotIndex}`).innerText = "المقاس الحالي: " + sizeText;
    
    const container = document.getElementById(`size-container-${slotIndex}`);
    if (container) {
        const buttons = container.getElementsByClassName('size-pill-btn');
        for (let btn of buttons) {
            btn.classList.remove('active');
        }
    }
    
    clickedButton.classList.add('active');
    calculateTotal();
}

// الحسابات الديناميكية وتحديث كارت الفاتورة
function calculateTotal() {
    let count = (currentOfferMode === 'single') ? 1 : currentQuantity;
    
    let originalPrice = count * 760;
    let itemsPrice = 730; 
    if(currentOfferMode === 'multi') {
        itemsPrice = 1400 + ((currentQuantity - 2) * 700);
    }
    
    let savings = originalPrice - itemsPrice;

    const govSelect = document.getElementById('client-governorate');
    let shippingCost = 0;
    let shippingText = "حدد المحافظة";

    if (govSelect && govSelect.value) {
        let selectedGov = govSelect.value;
        if (selectedGov === 'القاهرة' || selectedGov === 'الجيزة') {
            shippingCost = 70;
            shippingText = "70 ج.م";
        } else {
            shippingCost = 100;
            shippingText = "100 ج.م";
        }
    }

    let finalTotal = itemsPrice + shippingCost;

    let itemsSummaryHtml = "";
    for(let i = 1; i <= count; i++) {
        const colorEl = document.getElementById(`color-val-${i}`);
        const sizeEl = document.getElementById(`size-val-${i}`);
        
        let col = colorEl ? colorEl.value : 'اسود';
        let siz = sizeEl ? sizeEl.value : '✔️ L';
        siz = siz.replace('✔️ ', ''); 

        itemsSummaryHtml += `قطعة ${i} (${col} - مقاس ${siz})<br>`;
    }

    const itemsListEl = document.getElementById('invoice-items-list');
    const subtotalPriceEl = document.getElementById('invoice-subtotal-price');
    const shippingPriceEl = document.getElementById('invoice-shipping-price');
    const finalTotalEl = document.getElementById('invoice-final-total');
    const finalTotalInput = document.getElementById('final-total-price');
    const discountRow = document.getElementById('invoice-discount-row');
    const discountValueEl = document.getElementById('invoice-discount-value');

    if (itemsListEl) itemsListEl.innerHTML = itemsSummaryHtml;
    if (subtotalPriceEl) subtotalPriceEl.innerText = `${originalPrice} ج.م`;
    if (shippingPriceEl) shippingPriceEl.innerText = shippingText;
    
    if(savings > 0 && discountRow && discountValueEl) {
        discountRow.style.display = 'flex';
        discountValueEl.innerText = `-${savings} ج.م`;
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }
    
    if (finalTotalEl) finalTotalEl.innerText = `${finalTotal} ج.م`;
    if (finalTotalInput) finalTotalInput.value = finalTotal;
}

// معالجة الإرسال النهائي وتجميع البيانات وإرسالها للواتساب
function handleFormSubmit(event) {
    event.preventDefault();
    
    let count = (currentOfferMode === 'single') ? 1 : currentQuantity;
    
    // تجميع بيانات العميل من المدخلات
    let clientName = document.getElementById('client-name').value.trim();
    let clientPhone = document.getElementById('client-phone').value.trim();
    let clientAddress = document.getElementById('client-address').value.trim();
    
    const govSelect = document.getElementById('client-governorate');
    let governorate = govSelect.options[govSelect.selectedIndex].text;
    
    // حساب الأسعار لإرسالها بالرسالة
    let originalPrice = count * 760;
    let itemsPrice = (currentOfferMode === 'single') ? 730 : (1400 + ((currentQuantity - 2) * 700));
    let savings = originalPrice - itemsPrice;
    let shippingCost = (govSelect.value === 'القاهرة' || govSelect.value === 'الجيزة') ? 70 : 100;
    let finalTotal = itemsPrice + shippingCost;

    // تجميع تفاصيل القطع والألوان والمقاسات
    let itemsDetailsList = [];
    for(let i = 1; i <= count; i++) {
        let col = document.getElementById(`color-val-${i}`).value;
        let siz = document.getElementById(`size-val-${i}`).value.replace('✔️ ', '');
        itemsDetailsList.push(`القطعة ${i}: [لون ${col} - مقاس ${siz}]`);
    }

    // بناء نص رسالة الواتساب الاحترافية والمميزة
    let msg = "🛍️ *طلب جديد — عرب ستور* 🛍️\n\n" +
              "👤 *بيانات العميل المستلم*\n" +
              "• *الاسم بالكامل:* " + clientName + "\n" +
              "• *رقم الهاتف:* " + clientPhone + "\n" +
              "• *المحافظة:* " + governorate + "\n" +
              "• *العنوان بالتفصيل:* " + clientAddress + "\n\n" +
              "📦 *تفاصيل المنتجات والألوان المحددة:*\n" +
              "• نوع العرض: " + (currentOfferMode === 'single' ? 'عرض القطعة الواحدة' : 'عرض الأكثر من قطعة') + " (" + count + " قطع)\n" +
              "• الخيارات المحددة:\n" + itemsDetailsList.join("\n") + "\n\n" +
              "💰 *ملخص الحساب والدفع عند الاستلام*\n" +
              "• سعر القطع: " + itemsPrice + " ج.م بدلاً من " + originalPrice + " ج.م\n" +
              "• مصاريف التوصيل: " + shippingCost + " ج.م\n" +
              "• المبلغ الموفر للعميل: −" + savings + " ج.م 🎁\n" +
              "• *الإجمالي النهائي المطلوب من المندوب: " + finalTotal + " ج.م*\n\n" +
              "⏳ برجاء مراجعة البيانات وتأكيد التجهيز الفوري للطلب للشحن.\n" +
              "__أُرسلت تلقائياً من صفحة طقم بحر بسكوته__";

    // تشفير الرسالة والتوجيه الفوري إلى رابط سيرفر الواتساب الرسمي
    let targetUrl = "https://api.whatsapp.com/send?phone=" + WHATSAPP_NUMBER + "&text=" + encodeURIComponent(msg);
    window.location.href = targetUrl;
}

// تشغيل البناء المبدئي عند اكتمال تحميل عناصر الصفحة بأمان
window.addEventListener('DOMContentLoaded', () => {
    renderSlots(1);
});