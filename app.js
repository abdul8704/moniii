

const Utils = {
    generateId: () => crypto.randomUUID(),
    formatDate: (dateString) => new Date(dateString).toLocaleDateString(),
};

const Store = {
    KEYS: {
        BOOKS: 'bookApp_library_v2',
        CATEGORIES: 'bookApp_categories',
        THEME: 'bookApp_theme'
    },

    getBooks() {
        return JSON.parse(localStorage.getItem(this.KEYS.BOOKS) || '[]');
    },

    saveBooks(books) {
        localStorage.setItem(this.KEYS.BOOKS, JSON.stringify(books));
    },

    getCategories() {
        const defaultCategories = ['Fiction', 'Non-Fiction', 'Sci-Fi', 'Biography', 'Technology'];
        return JSON.parse(localStorage.getItem(this.KEYS.CATEGORIES) || JSON.stringify(defaultCategories));
    },

    saveCategories(categories) {
        localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
    },

    getTheme() {
        return localStorage.getItem(this.KEYS.THEME) || 'dark';
    },

    saveTheme(theme) {
        localStorage.setItem(this.KEYS.THEME, theme);
    }
};

class BookApp {
    constructor() {
        this.books = Store.getBooks();
        this.categories = Store.getCategories();
        this.filter = {
            search: '',
            category: 'all',
            status: 'all'
        };
        
        this.init();
    }

    init() {
        this.setupTheme();
        this.seedDataIfNeeded();
        this.render();
        this.bindEvents();
    }

    seedDataIfNeeded() {
        if (this.books.length === 0) {
            const seedBooks = [
                {
                    id: Utils.generateId(),
                    title: "The Great Gatsby",
                    author: "F. Scott Fitzgerald",
                    category: "Fiction",
                    status: "Available",
                    image: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: []
                },
                {
                    id: Utils.generateId(),
                    title: "Clean Code",
                    author: "Robert C. Martin",
                    category: "Technology",
                    status: "Borrowed",
                    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: [{ borrower: "John Doe", borrowDate: new Date().toISOString(), returnDate: null }]
                },
                {
                    id: Utils.generateId(),
                    title: "Dune",
                    author: "Frank Herbert",
                    category: "Sci-Fi",
                    status: "Available",
                    image: "https://images.unsplash.com/photo-1541963463532-d68292c34b19?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: []
                },
                {
                    id: Utils.generateId(),
                    title: "Atomic Habits",
                    author: "James Clear",
                    category: "Non-Fiction",
                    status: "Available",
                    image: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: []
                },
                {
                    id: Utils.generateId(),
                    title: "The Hobbit",
                    author: "J.R.R. Tolkien",
                    category: "Fiction",
                    status: "Available",
                    image: "https://images.unsplash.com/photo-1629992101753-56d196c8aabb?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: []
                },
                {
                    id: Utils.generateId(),
                    title: "Steve Jobs",
                    author: "Walter Isaacson",
                    category: "Biography",
                    status: "Available",
                    image: "https://images.unsplash.com/photo-1531297461136-82ae96c51365?auto=format&fit=crop&q=80&w=800",
                    addedDate: new Date().toISOString(),
                    history: []
                }
            ];
            this.books = seedBooks;
            Store.saveBooks(this.books);
            
            const seedCategories = ['Fiction', 'Technology', 'Sci-Fi', 'Non-Fiction', 'Biography'];
            seedCategories.forEach(cat => {
                if (!this.categories.includes(cat)) {
                    this.categories.push(cat);
                }
            });
            Store.saveCategories(this.categories);
        }
    }

    setupTheme() {
        const theme = Store.getTheme();
        document.documentElement.setAttribute('data-theme', theme);
        this.updateThemeIcon(theme);
    }

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        Store.saveTheme(next);
        this.updateThemeIcon(next);
    }

    updateThemeIcon(theme) {
        const sun = document.querySelector('.icon-sun');
        const moon = document.querySelector('.icon-moon');
        if (theme === 'light') {
            sun.classList.remove('hidden');
            moon.classList.add('hidden');
        } else {
            sun.classList.add('hidden');
            moon.classList.remove('hidden');
        }
    }

    addBook(bookData) {
        const newBook = {
            id: Utils.generateId(),
            ...bookData,
            status: 'Available',
            addedDate: new Date().toISOString(),
            history: []
        };
        this.books.push(newBook);
        Store.saveBooks(this.books);
        
        if (!this.categories.includes(bookData.category)) {
            this.categories.push(bookData.category);
            Store.saveCategories(this.categories);
        }
        
        this.render();
        return true; 
    }

    deleteBook(id) {
        if(confirm('Are you sure you want to delete this book?')) {
            this.books = this.books.filter(b => b.id !== id);
            Store.saveBooks(this.books);
            this.render();
        }
    }

    render() {
        this.renderStats();
        this.renderCategories();
        this.renderBooks();
    }
    
    renderCategories() {
        const list = document.getElementById('category-filter-list');
        const datalist = document.getElementById('category-list-suggestions');
        
        if (!list || !datalist) return;

        let html = `<li><button class="filter-btn ${this.filter.category === 'all' ? 'active' : ''}" data-category="all">All Books</button></li>`;
        this.categories.forEach(cat => {
            html += `<li><button class="filter-btn ${this.filter.category === cat ? 'active' : ''}" data-category="${cat}">${cat}</button></li>`;
        });
        list.innerHTML = html;

        const options = this.categories.map(cat => `<option value="${cat}">`).join('');
        datalist.innerHTML = options;
    }

    renderBooks() {
        const grid = document.getElementById('book-grid');
        if (!grid) return;

        let filtered = this.books;
        
        if (this.filter.search) {
            const term = this.filter.search.toLowerCase();
            filtered = filtered.filter(b => 
                b.title.toLowerCase().includes(term) || 
                b.author.toLowerCase().includes(term)
            );
        }

        if (this.filter.category !== 'all') {
            filtered = filtered.filter(b => b.category === this.filter.category);
        }

        if (this.filter.status !== 'all') {
            filtered = filtered.filter(b => b.status === this.filter.status);
        }

        if (filtered.length === 0) {
            grid.innerHTML = `<div class="empty-state"><p>No books found matching your criteria.</p></div>`;
            return;
        }

        grid.innerHTML = filtered.map(book => this.createBookCard(book)).join('');
        
        document.getElementById('book-count').textContent = `${filtered.length} book${filtered.length !== 1 ? 's' : ''}`;
    }

    createBookCard(book) {
        const isBorrowed = book.status === 'Borrowed';
        const badgeClass = isBorrowed ? 'borrowed' : 'available';
        const imageSrc = book.image || 'https://placehold.co/400x600?text=No+Cover';
        
        return `
        <article class="card book-card fade-in">
            <div class="card-image">
                <img src="${imageSrc}" alt="${book.title} cover" loading="lazy">
                <span class="badge ${badgeClass} status-badge">${book.status}</span>
            </div>
            <div class="card-content">
                <div class="card-header">
                    <h3>${book.title}</h3>
                    <p class="author">by ${book.author}</p>
                </div>
                <p class="category">
                    <i class="ph ph-folder-open"></i> ${book.category}
                </p>
                <div class="card-actions">
                    ${!isBorrowed ? 
                        `<button class="btn btn-primary" onclick="app.openBorrowModal('${book.id}')">Borrow</button>` : 
                        `<button class="btn btn-outline" onclick="app.returnBook('${book.id}')">Return</button>`
                    }
                    <button class="btn btn-icon btn-danger" onclick="app.deleteBook('${book.id}')" title="Delete"><i class="ph ph-trash"></i></button>
                </div>
            </div>
        </article>
        `;
    }

    viewHistory(id) {
        const book = this.books.find(b => b.id === id);
        if(!book) return;

        const container = document.getElementById('history-list-container');
        if (book.history.length === 0) {
            container.innerHTML = '<p class="text-secondary">No history available for this book.</p>';
        } else {
            const historyHtml = book.history.map(h => `
                <div style="border-bottom: 1px solid var(--border-color); padding: 0.5rem 0; font-size: 0.9rem;">
                    <div><strong>${h.borrower}</strong></div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem;">
                        Borrowed: ${Utils.formatDate(h.borrowDate)} <br>
                        Returned: ${h.returnDate ? Utils.formatDate(h.returnDate) : '<span style="color: var(--primary-color)">Current</span>'}
                    </div>
                </div>
            `).join('');
            container.innerHTML = historyHtml;
        }

        document.getElementById('history-modal').classList.remove('hidden');
    }

    renderStats() {
    }

    bindEvents() {
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.filter.search = e.target.value;
            this.renderBooks();
        });

        document.getElementById('category-filter-list').addEventListener('click', (e) => {
            const btn = e.target.closest('.filter-btn');
            if (btn) {
                this.filter.category = btn.getAttribute('data-category');
                this.render(); // Re-render to update active classes and grid
            }
        });

        document.getElementById('status-filter-group').addEventListener('change', (e) => {
            if (e.target.name === 'status-filter') {
                this.filter.status = e.target.value;
                this.renderBooks();
            }
        });

        const addBtn = document.getElementById('add-book-btn');
        const bookModal = document.getElementById('book-modal');
        const borrowModal = document.getElementById('borrow-modal');
        const historyModal = document.getElementById('history-modal');
        const closeBtns = document.querySelectorAll('.close-modal-btn');

        addBtn.addEventListener('click', () => {
            bookModal.classList.remove('hidden');
        });

        closeBtns.forEach(btn => btn.addEventListener('click', () => {
            bookModal.classList.add('hidden');
            borrowModal.classList.add('hidden');
            historyModal.classList.add('hidden');
        }));
        
        const bookForm = document.getElementById('book-form');
        bookForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = {
                title: document.getElementById('book-title').value,
                author: document.getElementById('book-author').value,
                category: document.getElementById('book-category').value,
                image: document.getElementById('book-image').value,
                status: document.querySelector('input[name="book-status"]:checked').value
            };
            
            this.addBook(formData);
            bookForm.reset();
            bookModal.classList.add('hidden');
        });

        const borrowForm = document.getElementById('borrow-form');
        borrowForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const bookId = document.getElementById('borrow-book-id').value;
            const borrower = document.getElementById('borrower-name').value;
            const date = document.getElementById('borrow-date').value;
            
            this.borrowBook(bookId, borrower, date);
            borrowForm.reset();
            borrowModal.classList.add('hidden');
        });
    }
    
    openBorrowModal(id) {
        const book = this.books.find(b => b.id === id);
        if (!book) return;

        document.getElementById('borrow-book-id').value = book.id;
        document.getElementById('borrow-book-title').textContent = book.title;
        document.getElementById('borrow-date').valueAsDate = new Date();
        
        document.getElementById('borrow-modal').classList.remove('hidden');
        document.getElementById('borrower-name').focus();
    }

    borrowBook(id, borrower, date) {
        const book = this.books.find(b => b.id === id);
        if (book && book.status === 'Available') {
            book.status = 'Borrowed';
            const historyEntry = {
                borrower: borrower,
                borrowDate: date,
                returnDate: null
            };
            book.history.push(historyEntry);
            Store.saveBooks(this.books);
            this.render();
        }
    }

    returnBook(id) {
        if (!confirm('Return this book?')) return;
        
        const book = this.books.find(b => b.id === id);
        if (book && book.status === 'Borrowed') {
            book.status = 'Available';
             const lastHistory = book.history[book.history.length - 1];
             if (lastHistory && !lastHistory.returnDate) {
                 lastHistory.returnDate = new Date().toISOString().split('T')[0];
             }
            Store.saveBooks(this.books);
            this.render();
        }
    }
}



document.addEventListener('DOMContentLoaded', () => {
    window.app = new BookApp();
});
