$D = {
    currentSlideData: null,
    recordCount: 0,
    recordPerPage: 5,
    totalPage: 0,
    currentPage: 1,
    selectedNode: null,
};

$UI = {
    slideContainer: document.getElementById('slide-container'),
    paginator: null,
    slideSearch: document.getElementById('search-slide'),
  };
  
  
document.addEventListener('DOMContentLoaded', () => {
    fetchCollections();
    
    const searchInput = document.getElementById('search-slide');
    searchInput.addEventListener('input', () => slideSearch(searchInput.value));

    document.getElementById('slidesPerPage').addEventListener('change', (e) => {
        $D.recordPerPage = parseInt(e.target.value, 10);
        $D.currentPage = 1; 
        displaySlides($D.currentSlideData, $D.currentPage);
        setupPagination($D.currentSlideData.length);
    });

    const selectPaginationContainer = document.querySelector('.select-pagination-container');
    selectPaginationContainer.style.display = 'none';

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });
});



function fetchCollections() {
    const store = new Store('../../data/');
    store.getAllCollection()
        .then((data) => {
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

    const parentCollections = data.filter(collection => !collection.pid);
    const childCollections = data.filter(collection => collection.pid);

    parentCollections.forEach((parentCollection) => {
        const parentColLink = createParentColLink(parentCollection, childCollections);
        sidebar.appendChild(parentColLink);
    });
}

let currentSelectedCollection = null;

function createParentColLink(parentCollection, childCollections) {
    const parentDiv = document.createElement('div');
    const parentLink = document.createElement('a');
    parentLink.href = '#';
    parentLink.classList.add('sidebar-link', 'text-decoration-none', 'd-block', 'py-2');
    parentLink.textContent = parentCollection.text;

    parentDiv.appendChild(parentLink);

    const childContainer = document.createElement('div');
    childContainer.classList.add('child-collections', 'ml-3');
    childContainer.style.display = 'none';

    childCollections.filter(child => child.pid === parentCollection._id.$oid).forEach((childCollection) => {
        const childLink = createColLink(childCollection);
        childContainer.appendChild(childLink);
    });

    parentDiv.appendChild(childContainer);

    parentLink.addEventListener('click', () => {
        childContainer.style.display = childContainer.style.display === 'none' ? 'block' : 'none';
        setSelectedCollection(parentLink);
    });

    return parentDiv;
}

function createColLink(collection) {
    const a = document.createElement('a');
    a.href = `#`;
    a.classList.add('sidebar-link', 'text-decoration-none', 'd-block', 'py-2');
    a.textContent = `${collection.text}`;
    a.addEventListener('click', () => {
        setSelectedCollection(a);
        fetchSlides(collection._id.$oid);
        currentPage = 1;
    });
    return a;
}

function setSelectedCollection(element) {
    if (currentSelectedCollection) {
        currentSelectedCollection.classList.remove('selected');
    }
    currentSelectedCollection = element;
    currentSelectedCollection.classList.add('selected');
}


function setupPagination(totalSlides) {
    const totalPages = Math.ceil(totalSlides / $D.recordPerPage);
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
        if (i === $D.currentPage) {
            pageItem.classList.add('active');
        }
        const pageLink = document.createElement('a');
        pageLink.classList.add('page-link');
        pageLink.href = '#';
        pageLink.textContent = i;
        pageLink.addEventListener('click', (e) => {
            e.preventDefault();
            $D.currentPage = i;
            displaySlides($D.currentSlideData, $D.currentPage);
            setupPagination($D.currentSlideData.length); 
        });
        pageItem.appendChild(pageLink);
        pagination.insertBefore(pageItem, pagination.children[pagination.children.length - 1]);
    }

    const prevPage = document.getElementById('prev-page');
    const nextPage = document.getElementById('next-page');
    prevPage.replaceWith(prevPage.cloneNode(true));
    nextPage.replaceWith(nextPage.cloneNode(true));

    document.getElementById('prev-page').addEventListener('click', (e) => {
        e.preventDefault();
        if ($D.currentPage > 1) {
            $D.currentPage--;
            displaySlides($D.currentSlideData, $D.currentPage);
            setupPagination($D.currentSlideData.length);
        }
    });

    document.getElementById('next-page').addEventListener('click', (e) => {
        e.preventDefault();
        if ($D.currentPage < totalPages) {
            $D.currentPage++;
            displaySlides($D.currentSlideData, $D.currentPage);
            setupPagination($D.currentSlideData.length);
        }
    });
}

function fetchSlides(collectionOid) {
    const store = new Store('../../data/');
    const query = {
        collections: collectionOid 
    };
    store.findSlide(null, null, null, null, query)
        .then((slides) => {
            if (slides) {
                $D.currentSlideData = slides;
                displaySlides(slides, $D.currentPage);
                setupPagination(slides.length);

                const selectPaginationContainer = document.querySelector('.select-pagination-container');
                selectPaginationContainer.style.display = 'flex';

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

    const start = (page - 1) * $D.recordPerPage;
    const end = start + $D.recordPerPage; 
    const paginatedSlides = slides.slice(start, end);

    paginatedSlides.forEach((slide) => {
        const slideCard = createSlideCard(slide);
        slideContainer.appendChild(slideCard);
    });

    const paginationContainer = document.getElementById('pagination-container');
    if (slides.length > 0) {
        paginationContainer.style.display = 'flex'; 
    } else {
        paginationContainer.style.display = 'none'; 
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

    if (slide.thumbnail) {
    // use a prebaked thumbnail if possible
    img.src = '../../' + slide.thumbnail;
  } else if (slide.height > slide.width) {
    // HEI
    img.src = `../../img/IIP/raw/?FIF=${d.location}&HEI=256&CVT=.jpg`;
  } else {
    // WID
    img.src = `../../img/IIP/raw/?FIF=${d.location}&WID=256&CVT=.jpg`;
  }
    
    imgContainer.appendChild(img);
    card.appendChild(imgContainer);

    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');

    const leftContainer = document.createElement('div');
    leftContainer.classList.add('left-container');

    const p = document.createElement('p');
    p.classList.add('card-text');
    p.textContent = `${slide.name}`;
    leftContainer.appendChild(p);

    const qualitySection = document.createElement('div');
    qualitySection.classList.add('quality-section');

    const isQualifiedRow = document.createElement('div');
    isQualifiedRow.classList.add('quality-row');

    const isQualifiedLable = document.createElement('span');
    isQualifiedLable.classList.add('quality-label');
    isQualifiedLable.textContent = 'IsQualified:';
    isQualifiedRow.appendChild(isQualifiedLable);
    
    const btnGroup = document.createElement('div');
    btnGroup.classList.add('btn-group', 'btn-group-sm');

    const trueRadio = document.createElement('input');
    trueRadio.type = 'radio';
    trueRadio.classList.add('btn-check');
    trueRadio.name = `isQualified-${slide._id.$oid}`;
    trueRadio.id = `trueRadio-${slide._id.$oid}`;
    trueRadio.autocomplete = 'off';
    if (slide.isQualified === 'True') trueRadio.checked = true;
    btnGroup.appendChild(trueRadio);

    const trueLabel = document.createElement('label');
    trueLabel.classList.add('btn', 'btn-outline-secondary');
    trueLabel.setAttribute('for', `trueRadio-${slide._id.$oid}`);
    trueLabel.textContent = 'True';
    btnGroup.appendChild(trueLabel);

    const falseRadio = document.createElement('input');
    falseRadio.type = 'radio';
    falseRadio.classList.add('btn-check');
    falseRadio.name = `isQualified-${slide._id.$oid}`;
    falseRadio.id = `falseRadio-${slide._id.$oid}`;
    falseRadio.autocomplete = 'off';
    if (slide.isQualified === 'False') falseRadio.checked = true;
    btnGroup.appendChild(falseRadio);

    const falseLabel = document.createElement('label');
    falseLabel.classList.add('btn', 'btn-outline-secondary');
    falseLabel.setAttribute('for', `falseRadio-${slide._id.$oid}`);
    falseLabel.textContent = 'False';
    btnGroup.appendChild(falseLabel);

    const unknownRadio = document.createElement('input');
    unknownRadio.type = 'radio';
    unknownRadio.classList.add('btn-check');
    unknownRadio.name = `isQualified-${slide._id.$oid}`;
    unknownRadio.id = `unknownRadio-${slide._id.$oid}`;
    unknownRadio.autocomplete = 'off';
    if (slide.isQualified === 'Unknown') unknownRadio.checked = true;
    btnGroup.appendChild(unknownRadio);

    const unknownLabel = document.createElement('label');
    unknownLabel.classList.add('btn', 'btn-outline-secondary');
    unknownLabel.setAttribute('for', `unknownRadio-${slide._id.$oid}`);
    unknownLabel.textContent = 'Unknown';
    btnGroup.appendChild(unknownLabel);
    
    function initializeTooltip(label, title) {
        label.setAttribute('data-bs-toggle', 'tooltip');
        label.setAttribute('data-bs-placement', 'top');
        label.setAttribute('title', title);
        label.setAttribute('data-bs-custom-class', 'small-tooltip');
        new bootstrap.Tooltip(label);
    }

    const style = document.createElement('style');
    style.innerHTML = `
        .tooltip.small-tooltip .tooltip-inner {
            font-size: 0.85rem; 
            padding: 3px 8px;
        }
    `;
    document.head.appendChild(style);

    function clearTooltip() {
        [trueLabel, falseLabel, unknownLabel].forEach(label => {
            const tooltipInstance = bootstrap.Tooltip.getInstance(label);
            if (tooltipInstance) {
                tooltipInstance.dispose();
            }
            label.removeAttribute('data-bs-toggle');
            label.removeAttribute('data-bs-placement');
            label.removeAttribute('title');
        });
    }

    if (slide.isHumanmade) {
        if (trueRadio.checked) {
            trueLabel.classList.add(getQualifiedClass('True'));
            trueLabel.classList.remove('btn-outline-secondary');
            initializeTooltip(trueLabel, 'Defined by Human');
        } else if (falseRadio.checked) {
            falseLabel.classList.add(getQualifiedClass('False'));
            falseLabel.classList.remove('btn-outline-secondary');
            img.classList.add('grayscale'); 
            initializeTooltip(falseLabel, 'Defined by Human');
        } else if (unknownRadio.checked) {
            unknownLabel.classList.add(getQualifiedClass('Unknown'));
            unknownLabel.classList.remove('btn-outline-secondary');
            initializeTooltip(unknownLabel, 'Defined by Human');
        }
    } else {
        if (trueRadio.checked) {
            initializeTooltip(trueLabel, 'Defined by AI');
        } else if (falseRadio.checked) {
            initializeTooltip(falseLabel, 'Defined by AI');
        } else if (unknownRadio.checked) {
            initializeTooltip(unknownLabel, 'Defined by AI');
        }
    }

    /*Test if isQualified data of slide updated
    function simulateUpdateSlide(slideId, isQualified) {
        console.log(`Simulating update for slide ID: ${slideId}, isQualified: ${isQualified}`);

        return new Promise((resolve) => {
            setTimeout(() => {
                const response = { success: true, updatedSlide: { id: slideId, isQualified: isQualified }};
                resolve(response);
            }, 1000); 
        });
    }
    */

    let previousState = {
        isQualified: slide.isQualified,
        isHumanmade: slide.isHumanmade,
        tooltip: 'Defined by AI'
    };

    function saveCurrentState() {
        previousState = {
            isQualified: slide.isQualified,
            isHumanmade: slide.isHumanmade,
            tooltip: slide.isHumanmade ? 'Defined by Human' : 'Defined by AI'
        };
    }

    function restorePreviousState() {
        clearTooltip();

        if (previousState.isQualified === 'True') {
            trueRadio.checked = true;
            falseRadio.checked = false;
            unknownRadio.checked = false;
            img.classList.remove('grayscale');
            trueLabel.classList.add('active');
            trueLabel.classList.remove('btn-outline-secondary');
            trueLabel.classList.add(previousState.isHumanmade ? getQualifiedClass('True') : 'btn-outline-secondary');
            initializeTooltip(trueLabel, previousState.tooltip);

            falseLabel.classList.remove('active', getQualifiedClass('False'));
            falseLabel.classList.add('btn-outline-secondary');

            unknownLabel.classList.remove('active', getQualifiedClass('Unknown'));
            unknownLabel.classList.add('btn-outline-secondary');
        } else if (previousState.isQualified === 'False') {
            trueRadio.checked = false;
            falseRadio.checked = true;
            unknownRadio.checked = false;
            img.classList.add('grayscale');
            falseLabel.classList.add('active');
            falseLabel.classList.remove('btn-outline-secondary');
            falseLabel.classList.add(previousState.isHumanmade ? getQualifiedClass('False') : 'btn-outline-secondary');
            initializeTooltip(falseLabel, previousState.tooltip);

            trueLabel.classList.remove('active', getQualifiedClass('True'));
            trueLabel.classList.add('btn-outline-secondary');

            unknownLabel.classList.remove('active', getQualifiedClass('Unknown'));
            unknownLabel.classList.add('btn-outline-secondary');
        } else if (previousState.isQualified === 'Unknown') {
            trueRadio.checked = false;
            falseRadio.checked = false;
            unknownRadio.checked = true;
            img.classList.remove('grayscale');
            unknownLabel.classList.add('active');
            unknownLabel.classList.remove('btn-outline-secondary');
            unknownLabel.classList.add(previousState.isHumanmade ? getQualifiedClass('Unknown') : 'btn-outline-secondary');
            initializeTooltip(unknownLabel, previousState.tooltip);


            trueLabel.classList.remove('active', getQualifiedClass('True'));
            trueLabel.classList.add('btn-outline-secondary');

            falseLabel.classList.remove('active', getQualifiedClass('False'));
            falseLabel.classList.add('btn-outline-secondary');
        }
    }

    function handleRadioClick(isQualified, label, otherLabels) {
        saveCurrentState(); 

        img.classList.toggle('grayscale', isQualified == 'False');
        label.classList.add('active');
        label.classList.remove('btn-outline-secondary');
        label.classList.add(getQualifiedClass(isQualified));
        clearTooltip();
        initializeTooltip(label, 'Defined by Human');

        otherLabels.forEach(otherLabel => {
            otherLabel.classList.remove('active', getQualifiedClass(otherLabel.textContent));
            otherLabel.classList.add('btn-outline-secondary');
        });

        const update = {
            isQualified: isQualified,
            isHumanmade: true
        };

        const store = new Store('../../data/');
        store.updateSlideForQuality(slide._id.$oid, update)
            .then(data => {
                if (data) { 
                    console.log('Slide updated successfully:', data);
                    slide.isQualified = isQualified;
                    slide.isHumanmade = true;
            }else {
                console.error('Failed to update slide:', data);
                setTimeout(() => {
                    restorePreviousState();
                }, 1000);
            }
        })
        .catch(error => {
            console.error('Error updating slide:', error);
            restorePreviousState();
        });
    }

    trueRadio.addEventListener('click', () => {
        handleRadioClick('True', trueLabel, [falseLabel, unknownLabel]);
    });

    falseRadio.addEventListener('click', () => {
        handleRadioClick('False', falseLabel, [trueLabel, unknownLabel]);
    });

    unknownRadio.addEventListener('click', () => {
        handleRadioClick('Unknown', unknownLabel, [trueLabel, falseLabel]);
    });
    
    isQualifiedRow.appendChild(btnGroup);
    qualitySection.appendChild(isQualifiedRow);
    
    
    const accuracyRow = document.createElement('div');
    accuracyRow.classList.add('quality-row');

    const accuracyLabel = document.createElement('span');
    accuracyLabel.classList.add('quality-label');
    accuracyLabel.textContent = 'Quality Accuracy:';
    accuracyRow.appendChild(accuracyLabel);

    const accuracyValue = document.createElement('span');
    accuracyValue.classList.add('quality-value');
    accuracyValue.textContent = `${slide.accuracy || 0}`;
    accuracyRow.appendChild(accuracyValue);

    qualitySection.appendChild(accuracyRow);

    const rateRow = document.createElement('div');
    rateRow.classList.add('quality-row');

    const rateLabel = document.createElement('span');
    rateLabel.classList.add('quality-label');
    rateLabel.textContent = 'Quality Rate:';
    rateRow.appendChild(rateLabel);

    const rateValue = document.createElement('span');
    rateValue.classList.add('quality-value');
    rateValue.textContent = `${slide.rate || 0}`;
    rateRow.appendChild(rateValue);

    qualitySection.appendChild(rateRow);
    leftContainer.appendChild(qualitySection);

    const mainContainer = document.createElement('div');
    mainContainer.classList.add('d-flex', 'justify-content-between', 'align-items-start');
    mainContainer.appendChild(leftContainer);


    cardBody.appendChild(mainContainer);
    card.appendChild(cardBody);
    col.appendChild(card);

    return col;
}

function getQualifiedClass(isQualified) {
    switch (isQualified) {
        case 'True':
            return 'btn-success';
        case 'False':
            return 'btn-danger';
        case 'Unknown':
            return 'btn-warning';
        default:
            return 'btn-secondary';
    }
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

