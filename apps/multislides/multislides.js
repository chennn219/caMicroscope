$D = {
    currentSlideData: null,
    recordCount: 0,
    recordPerPage: 25,
    totalPage: 0,
    currentPage: 1,
    selectedNode: null,
};

$UI = {
    slideContainer: document.getElementById('slide-container'),
    paginator: null,
    slideSearch: document.getElementById('search-slide'),
    // message: new MessageQueue({position: 'bottom-left'}),
  };
  
  
document.addEventListener('DOMContentLoaded', () => {
    fetchCollections();
    
    const searchInput = document.getElementById('search-slide');
    searchInput.addEventListener('input', () => slideSearch(searchInput.value));
});

function fetchCollections() {
    const store = new Store('../../data/');
    store.getAllCollection()
        .then((data) => {
            console.log(data)
            if (data) {
                displayCollections(data);
            } else {
                console.error('No data received');
            }
        })
        .catch((error) => {
            console.error('Error fetching collections:', error);
        });
}

function displayCollections(data) {
    const sidebar = document.querySelector('.sidebar');

    data.forEach((collection) => {
        const colLink = createColLink(collection);
        sidebar.appendChild(colLink);
    });
}

let currentPage = 1;
const slidesPerPage = 18;

function createColLink(collection) {
    const a = document.createElement('a');
    a.href = `#`;
    a.classList.add('sidebar-link', 'text-decoration-none', 'd-block', 'py-2');
    a.textContent = `${collection.text}`;
    a.addEventListener('click', () => {
        fetchSlides(collection.text);
        currentPage = 1;
    });
    return a;
}

function fetchSlides(collectionText) {
    const store = new Store('../../data/');
    store.getSlidesByCollection()
        .then((slides) => {
            if (slides) {
                const filteredSlides = slides.filter(slide => slide.token_id === collectionText);
                $D.currentSlideData = filteredSlides;
                displaySlides(filteredSlides, currentPage);
                setupPagination(filteredSlides.length);
            } else {
                console.error('No slides found');
            }
        })
        .catch((error) => {
            console.error('Error fetching slides:', error);
        });

}

function displaySlides(slides, page) {
    const slideContainer = document.getElementById('slide-container');
    slideContainer.innerHTML = ''; 

    const start = (page - 1) * slidesPerPage;
    const end = start + slidesPerPage;
    const paginatedSlides = slides.slice(start, end);

    paginatedSlides.forEach((slide) => {
        const slideCard = createSlideCard(slide);
        slideContainer.appendChild(slideCard);
    });

    const paginationContainer = document.getElementById('pagination-container');
    if (slides.length > 0) {
        paginationContainer.style.display = 'flex'; // Show pagination only if slides exist
    } else {
        paginationContainer.style.display = 'none'; // Hide pagination if no slides
    }
}

function createSlideCard(slide) {
    const col = document.createElement('div');
    col.classList.add('col');

    const card = document.createElement('div');
    card.classList.add('card', 'shadow-sm');

    const imgContainer = document.createElement('div');
    imgContainer.classList.add('slide-image-container');

    const img = document.createElement('img');
    img.classList.add('slide-image');
    //const thumbnailPath = `/images/thumbnails/${slide.image}.png`;
    img.src = '../../' + slide.thumbnail;

    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const p = document.createElement('p');
    p.classList.add('card-text');
    p.textContent = `${slide.name}`;
    cardBody.appendChild(p);

    const div = document.createElement('div');
    div.classList.add('d-flex', 'justify-content-between', 'align-items-center');

    const small = document.createElement('small');
    small.classList.add('text-body-secondary');
    small.textContent = `Isqualified: ${slide.qualityCheck}`;
    div.appendChild(small);

    const btnGroup = document.createElement('div');
    btnGroup.classList.add('btn-group');

    const yesBtn = document.createElement('button');
    yesBtn.type = 'button';
    yesBtn.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'btn-yes');
    yesBtn.textContent = 'YES';
    yesBtn.addEventListener('click', () => {
        img.classList.remove('grayscale');
        yesBtn.classList.add('active');
        noBtn.classList.remove('active');
    });
    btnGroup.appendChild(yesBtn);

    const noBtn = document.createElement('button');
    noBtn.type = 'button';
    noBtn.classList.add('btn', 'btn-sm', 'btn-outline-secondary', 'btn-no');
    noBtn.textContent = 'NO';
    noBtn.addEventListener('click', () => {
        img.classList.add('grayscale');
        noBtn.classList.add('active');
        yesBtn.classList.remove('active');
    });
    btnGroup.appendChild(noBtn);

    div.appendChild(btnGroup);
    cardBody.appendChild(div);

    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
}

function slideSearch(pattern) {
    const regex = new RegExp(pattern, 'gi');
    
    document.querySelectorAll('.col').forEach((card) => {
      const text = card.querySelector('.card-text').textContent;
      if (text.match(regex)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    });
  }

function setupPagination(totalSlides) {
    const totalPages = Math.ceil(totalSlides / slidesPerPage);
    const pagination = document.getElementById('pagination');

    // Clear previous pagination items
    const pageItems = Array.from(pagination.querySelectorAll('.page-item'));
    pageItems.forEach((item, index) => {
        if (index !== 0 && index !== pageItems.length - 1) {
            item.remove();
        }
    });

    // Create page number items
    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('page-item');
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentPage = i;
            displaySlides($D.currentSlideData, currentPage);
            setupPagination($D.currentSlideData.length); // Update pagination
        });
        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, pagination.children[pagination.children.length - 1]);
    }

    document.getElementById('prev-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            displaySlides($D.currentSlideData, currentPage);
            setupPagination($D.currentSlideData.length);
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            displaySlides($D.currentSlideData, currentPage);
            setupPagination($D.currentSlideData.length);
        }
    });
}