const nav = document.querySelector('.nav');
const forms = document.querySelectorAll('.containerForm');
const tabs = document.querySelectorAll('.tab');
const inductor = document.querySelector('.inductor');

nav.addEventListener('click', (e) => {
  if (e.target.classList.contains('tab')) {
    // Toggle activeTab class on tabs
    tabs.forEach((tab) => tab.classList.remove('activeTab'));
    e.target.classList.add('activeTab');

    // Toggle forms visibility
    forms.forEach((form) => form.classList.add('hide'));
    document.getElementById(e.target.dataset.target).classList.remove('hide');

    // Move the inductor to the active tab
    const tabRect = e.target.getBoundingClientRect();
    const navRect = nav.getBoundingClientRect();
    inductor.style.width = `${tabRect.width}px`;
    inductor.style.left = `${tabRect.left - navRect.left}px`;
  }
});
