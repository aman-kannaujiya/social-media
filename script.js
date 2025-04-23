// Data Storage and Management
class SocialMediaApp {
    constructor() {
        this.currentUser = null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.posts = JSON.parse(localStorage.getItem('posts')) || [];
        this.comments = JSON.parse(localStorage.getItem('comments')) || [];
        this.friendRequests = JSON.parse(localStorage.getItem('friendRequests')) || [];
        
        this.initializeApp();
        this.setupEventListeners();
    }

    initializeApp() {
        // Check if user is logged in
        const loggedInUserId = localStorage.getItem('currentUserId');
    
        if (loggedInUserId) {
            this.currentUser = this.users.find(user => user.id === loggedInUserId);
            if (this.currentUser) {
                this.showLoggedInState();
                this.navigateTo('home'); // <-- USE THIS
            } else {
                this.showLoggedOutState();
            }
        } else {
            this.showLoggedOutState();
        }
        
    }

    setupEventListeners() {
        // Navigation
        document.getElementById('logo').addEventListener('click', () => this.navigateTo('home'));
        document.getElementById('nav-home').addEventListener('click', () => this.navigateTo('home'));
        document.getElementById('nav-profile').addEventListener('click', () => this.navigateTo('profile'));
        document.getElementById('nav-friends').addEventListener('click', () => this.navigateTo('friends'));
        document.getElementById('nav-logout').addEventListener('click', () => this.logout());
        document.getElementById('nav-login').addEventListener('click', () => this.navigateTo('login'));

        // Menu
        document.getElementById('menu-news-feed').addEventListener('click', () => this.navigateTo('home'));
        document.getElementById('menu-profile').addEventListener('click', () => this.navigateTo('profile'));
        document.getElementById('menu-friends').addEventListener('click', () => this.navigateTo('friends'));

        // Auth Forms
        document.getElementById('switch-to-register').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('login-form').classList.add('hidden');
            document.getElementById('register-form').classList.remove('hidden');
        });

        document.getElementById('switch-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('register-form').classList.add('hidden');
            document.getElementById('login-form').classList.remove('hidden');
        });

        document.getElementById('login-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.login();
        });

        document.getElementById('register-form-element').addEventListener('submit', (e) => {
            e.preventDefault();
            this.register();
        });

        // Post Creation
        document.getElementById('create-post-btn').addEventListener('click', () => this.createPost());

        // Search
        document.getElementById('search-input').addEventListener('input', (e) => this.handleSearch(e.target.value));
    }

    navigateTo(page) {
        // Hide all content sections
        document.getElementById('auth-container').classList.add('hidden');
        document.getElementById('home-content').classList.add('hidden');
        document.getElementById('profile-content').classList.add('hidden');
        document.getElementById('friends-content').classList.add('hidden');

        if (!this.currentUser && page !== 'login') {
            this.showToast('Please log in to continue', 'error');
            page = 'login';
        }

        switch (page) {
            case 'login':
                document.getElementById('auth-container').classList.remove('hidden');
                document.getElementById('login-form').classList.remove('hidden');
                document.getElementById('register-form').classList.add('hidden');
                break;
            case 'register':
                document.getElementById('auth-container').classList.remove('hidden');
                document.getElementById('login-form').classList.add('hidden');
                document.getElementById('register-form').classList.remove('hidden');
                break;
            case 'home':
                document.getElementById('home-content').classList.remove('hidden');
                this.renderHomePage();
                break;
            case 'profile':
                document.getElementById('profile-content').classList.remove('hidden');
                this.renderProfilePage();
                break;
            case 'friends':
                document.getElementById('friends-content').classList.remove('hidden');
                this.renderFriendsPage();
                break;
            default:
                document.getElementById('home-content').classList.remove('hidden');
                this.renderHomePage();
        }
    }

    showLoggedInState() {
        document.getElementById('nav-logout').classList.remove('hidden');
        document.getElementById('nav-login').classList.add('hidden');
        document.getElementById('nav-profile').classList.remove('hidden');
        document.getElementById('nav-friends').classList.remove('hidden');
        
        // Show user status indicator
        const userStatus = document.getElementById('user-status');
        userStatus.classList.remove('hidden');
        
        // Update status with current user info
        document.getElementById('status-avatar').textContent = this.getInitials(this.currentUser.name);
        document.getElementById('status-name').textContent = this.currentUser.name;
    }

    showLoggedOutState() {
        document.getElementById('nav-logout').classList.add('hidden');
        document.getElementById('nav-login').classList.remove('hidden');
        document.getElementById('nav-profile').classList.add('hidden');
        document.getElementById('nav-friends').classList.add('hidden');
        
        // Hide user status indicator
        document.getElementById('user-status').classList.add('hidden');
        
        this.navigateTo('login');
    }

    // Authentication Methods
    login() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;

        // const user = this.users.find(user => user.email === email && user.password === password);
        const user = this.users.find(u => u.email === email.trim() && u.password === password.trim());


        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUserId', user.id);
            this.showToast('Login successful!', 'success');
            this.showLoggedInState();
            this.navigateTo('home');
        } else {
            this.showToast('Invalid email or password', 'error');
        }
    }

    register() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            this.showToast('Passwords do not match', 'error');
            return;
        }

        if (this.users.some(user => user.email === email)) {
            this.showToast('Email already in use', 'error');
            return;
        }

        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password,
            friends: [],
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        this.showToast('Registration successful! Please log in.', 'success');
        document.getElementById('register-form').classList.add('hidden');
        document.getElementById('login-form').classList.remove('hidden');

        // Auto-fill login form
        document.getElementById('login-email').value = email;
        document.getElementById('login-password').value = password;
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUserId');
        this.showToast('Logged out successfully', 'success');
        this.showLoggedOutState();
    }

    // Post Methods
    createPost() {
        const content = document.getElementById('post-content').value.trim();
        
        if (!content) {
            this.showToast('Post cannot be empty', 'error');
            return;
        }

        const newPost = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            content,
            likes: [],
            dislikes: [],
            shares: 0,
            createdAt: new Date().toISOString()
        };

        this.posts.unshift(newPost);
        localStorage.setItem('posts', JSON.stringify(this.posts));

        document.getElementById('post-content').value = '';
        this.showToast('Post created successfully!', 'success');
        this.renderPosts();
    }

    likePost(postId) {
        const post = this.posts.find(post => post.id === postId);
        if (!post) return;

        const userLiked = post.likes.includes(this.currentUser.id);
        const userDisliked = post.dislikes.includes(this.currentUser.id);

        if (userLiked) {
            // Unlike
            post.likes = post.likes.filter(id => id !== this.currentUser.id);
        } else {
            // Like
            post.likes.push(this.currentUser.id);
            
            // Remove from dislikes if present
            if (userDisliked) {
                post.dislikes = post.dislikes.filter(id => id !== this.currentUser.id);
            }
        }

        localStorage.setItem('posts', JSON.stringify(this.posts));
        this.renderPosts();
    }

    dislikePost(postId) {
        const post = this.posts.find(post => post.id === postId);
        if (!post) return;

        const userLiked = post.likes.includes(this.currentUser.id);
        const userDisliked = post.dislikes.includes(this.currentUser.id);

        if (userDisliked) {
            // Remove dislike
            post.dislikes = post.dislikes.filter(id => id !== this.currentUser.id);
        } else {
            // Dislike
            post.dislikes.push(this.currentUser.id);
            
            // Remove from likes if present
            if (userLiked) {
                post.likes = post.likes.filter(id => id !== this.currentUser.id);
            }
        }

        localStorage.setItem('posts', JSON.stringify(this.posts));
        this.renderPosts();
    }

    sharePost(postId) {
        const post = this.posts.find(post => post.id === postId);
        if (!post) return;

        post.shares++;
        localStorage.setItem('posts', JSON.stringify(this.posts));
        
        // Create a new shared post
        const sharedPost = {
            id: Date.now().toString(),
            userId: this.currentUser.id,
            content: `Shared: ${post.content}`,
            originalPostId: post.id,
            likes: [],
            dislikes: [],
            shares: 0,
            createdAt: new Date().toISOString()
        };

        this.posts.unshift(sharedPost);
        localStorage.setItem('posts', JSON.stringify(this.posts));
        
        this.showToast('Post shared successfully!', 'success');
        this.renderPosts();
    }

    addComment(postId, commentText) {
        if (!commentText.trim()) {
            this.showToast('Comment cannot be empty', 'error');
            return;
        }

        const newComment = {
            id: Date.now().toString(),
            postId,
            userId: this.currentUser.id,
            content: commentText,
            createdAt: new Date().toISOString()
        };

        this.comments.push(newComment);
        localStorage.setItem('comments', JSON.stringify(this.comments));
        
        this.showToast('Comment added successfully!', 'success');
        this.renderPosts();
    }

    // Friend Methods
    sendFriendRequest(userId) {
        if (userId === this.currentUser.id) {
            this.showToast('You cannot add yourself as a friend', 'error');
            return;
        }

        // Check if already friends
        if (this.currentUser.friends.includes(userId)) {
            this.showToast('Already friends with this user', 'error');
            return;
        }

        // Check if request already sent
        const existingRequest = this.friendRequests.find(
            req => req.senderId === this.currentUser.id && req.receiverId === userId
        );

        if (existingRequest) {
            this.showToast('Friend request already sent', 'error');
            return;
        }

        const newRequest = {
            id: Date.now().toString(),
            senderId: this.currentUser.id,
            receiverId: userId,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        this.friendRequests.push(newRequest);
        localStorage.setItem('friendRequests', JSON.stringify(this.friendRequests));
        
        this.showToast('Friend request sent!', 'success');
        this.renderFriendSuggestions();
    }

    acceptFriendRequest(requestId) {
        const request = this.friendRequests.find(req => req.id === requestId);
        if (!request || request.receiverId !== this.currentUser.id) return;

        // Update request status
        request.status = 'accepted';
        
        // Add to friends list for both users
        const sender = this.users.find(user => user.id === request.senderId);
        const receiver = this.currentUser;

        if (!sender.friends.includes(receiver.id)) {
            sender.friends.push(receiver.id);
        }
        
        if (!receiver.friends.includes(sender.id)) {
            receiver.friends.push(sender.id);
        }

        localStorage.setItem('users', JSON.stringify(this.users));
        localStorage.setItem('friendRequests', JSON.stringify(this.friendRequests));
        
        this.showToast('Friend request accepted!', 'success');
        this.renderFriendRequests();
        this.renderFriendsList();
    }

    rejectFriendRequest(requestId) {
        const request = this.friendRequests.find(req => req.id === requestId);
        if (!request || request.receiverId !== this.currentUser.id) return;

        // Update request status
        request.status = 'rejected';
        localStorage.setItem('friendRequests', JSON.stringify(this.friendRequests));
        
        this.showToast('Friend request rejected', 'success');
        this.renderFriendRequests();
    }

    removeFriend(userId) {
        // Remove from current user's friends
        this.currentUser.friends = this.currentUser.friends.filter(id => id !== userId);
        
        // Remove from other user's friends
        const otherUser = this.users.find(user => user.id === userId);
        if (otherUser) {
            otherUser.friends = otherUser.friends.filter(id => id !== this.currentUser.id);
        }

        localStorage.setItem('users', JSON.stringify(this.users));
        
        this.showToast('Friend removed', 'success');
        this.renderFriendsList();
        this.renderAllFriends();
    }

    // Rendering Methods
    renderHomePage() {
        this.renderPosts();
        this.renderFriendsList();
        this.renderFriendSuggestions();
    }

    renderPosts(filter = null) {
        const postsContainer = document.getElementById('posts-container');
        postsContainer.innerHTML = '';

        let filteredPosts = this.posts;

        if (filter === 'user') {
            // Filter posts by current user
            filteredPosts = this.posts.filter(post => post.userId === this.currentUser.id);
        } else if (filter === 'friends') {
            // Filter posts by current user and friends
            filteredPosts = this.posts.filter(post => 
                post.userId === this.currentUser.id || 
                this.currentUser.friends.includes(post.userId)
            );
        } else if (typeof filter === 'string' && filter.trim()) {
            // Filter posts by search query
            const searchQuery = filter.toLowerCase();
            filteredPosts = this.posts.filter(post => {
                const postContent = post.content.toLowerCase();
                const postUser = this.users.find(user => user.id === post.userId);
                const userName = postUser ? postUser.name.toLowerCase() : '';
                
                return postContent.includes(searchQuery) || userName.includes(searchQuery);
            });
        }

        if (filteredPosts.length === 0) {
            postsContainer.innerHTML = '<div class="text-center mt-20">No posts to display</div>';
            return;
        }

        filteredPosts.forEach(post => {
            const postUser = this.users.find(user => user.id === post.userId);
            const postComments = this.comments.filter(comment => comment.postId === post.id);
            const userLiked = post.likes.includes(this.currentUser.id);
            const userDisliked = post.dislikes.includes(this.currentUser.id);
            const isCurrentUserPost = post.userId === this.currentUser.id;
            
            const postElement = document.createElement('div');
            postElement.className = 'post';
            postElement.innerHTML = `
                <div class="post-header">
                    <div class="post-avatar">${this.getInitials(postUser.name)}</div>
                    <div>
                        <div class="post-user">${postUser.name}</div>
                        <div class="post-time">${this.formatDate(post.createdAt)}</div>
                    </div>
                </div>
                <div class="post-content">${post.content}</div>
                <div class="post-stats">
                    <div>${post.likes.length} likes, ${post.dislikes.length} dislikes</div>
                    <div>${post.shares} shares, ${postComments.length} comments</div>
                </div>
                <div class="post-actions">
                    <div class="post-action ${userLiked ? 'liked' : ''}" data-action="like" data-post-id="${post.id}">
                        Like
                    </div>
                    <div class="post-action ${userDisliked ? 'disliked' : ''}" data-action="dislike" data-post-id="${post.id}">
                        Dislike
                    </div>
                    <div class="post-action" data-action="comment" data-post-id="${post.id}">
                        Comment
                    </div>
                    <div class="post-action" data-action="share" data-post-id="${post.id}">
                        Share
                    </div>
                    ${isCurrentUserPost ? `
                        <div class="post-action" data-action="delete" data-post-id="${post.id}">
                            Delete
                        </div>
                    ` : ''}
                </div>
                <div class="comments-section" id="comments-${post.id}">
                    ${postComments.length > 0 ? `
                        <div class="comments-list">
                            ${postComments.map(comment => {
                                const commentUser = this.users.find(user => user.id === comment.userId);
                                return `
                                    <div class="comment">
                                        <div class="comment-avatar">${this.getInitials(commentUser.name)}</div>
                                        <div class="comment-content">
                                            <div class="comment-user">${commentUser.name}</div>
                                            <div class="comment-text">${comment.content}</div>
                                        </div>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    ` : ''}
                    <div class="add-comment">
                        <input type="text" placeholder="Write a comment..." id="comment-input-${post.id}">
                        <button data-post-id="${post.id}" class="comment-submit-btn">Post</button>
                    </div>
                </div>
            `;

            postsContainer.appendChild(postElement);

            // Add event listeners for post actions
            const likeBtn = postElement.querySelector('[data-action="like"]');
            const dislikeBtn = postElement.querySelector('[data-action="dislike"]');
            const shareBtn = postElement.querySelector('[data-action="share"]');
            const deleteBtn = postElement.querySelector('[data-action="delete"]');
            const commentSubmitBtn = postElement.querySelector('.comment-submit-btn');

            likeBtn.addEventListener('click', () => this.likePost(post.id));
            dislikeBtn.addEventListener('click', () => this.dislikePost(post.id));
            shareBtn.addEventListener('click', () => this.sharePost(post.id));
            
            if (deleteBtn) {
                deleteBtn.addEventListener('click', () => this.deletePost(post.id));
            }

            commentSubmitBtn.addEventListener('click', () => {
                const commentInput = document.getElementById(`comment-input-${post.id}`);
                this.addComment(post.id, commentInput.value);
                commentInput.value = '';
            });
        });

        // Also update profile posts if we're filtering for user
        if (filter === 'user') {
            const profilePostsContainer = document.getElementById('profile-posts-container');
            profilePostsContainer.innerHTML = postsContainer.innerHTML;

            // Re-attach event listeners for profile posts
            this.attachPostEventListeners(profilePostsContainer);
        }
    }

    attachPostEventListeners(container) {
        const likeBtns = container.querySelectorAll('[data-action="like"]');
        const dislikeBtns = container.querySelectorAll('[data-action="dislike"]');
        const shareBtns = container.querySelectorAll('[data-action="share"]');
        const deleteBtns = container.querySelectorAll('[data-action="delete"]');
        const commentSubmitBtns = container.querySelectorAll('.comment-submit-btn');

        likeBtns.forEach(btn => {
            const postId = btn.getAttribute('data-post-id');
            btn.addEventListener('click', () => this.likePost(postId));
        });

        dislikeBtns.forEach(btn => {
            const postId = btn.getAttribute('data-post-id');
            btn.addEventListener('click', () => this.dislikePost(postId));
        });

        shareBtns.forEach(btn => {
            const postId = btn.getAttribute('data-post-id');
            btn.addEventListener('click', () => this.sharePost(postId));
        });

        deleteBtns.forEach(btn => {
            const postId = btn.getAttribute('data-post-id');
            btn.addEventListener('click', () => this.deletePost(postId));
        });

        commentSubmitBtns.forEach(btn => {
            const postId = btn.getAttribute('data-post-id');
            btn.addEventListener('click', () => {
                const commentInput = document.getElementById(`comment-input-${postId}`);
                this.addComment(postId, commentInput.value);
                commentInput.value = '';
            });
        });
    }

    deletePost(postId) {
        const post = this.posts.find(post => post.id === postId);
        if (!post || post.userId !== this.currentUser.id) return;

        // Remove post
        this.posts = this.posts.filter(p => p.id !== postId);
        
        // Remove associated comments
        this.comments = this.comments.filter(comment => comment.postId !== postId);
        
        localStorage.setItem('posts', JSON.stringify(this.posts));
        localStorage.setItem('comments', JSON.stringify(this.comments));
        
        this.showToast('Post deleted successfully', 'success');
        this.renderPosts();
        this.renderProfilePage();
    }

    renderFriendsList() {
        const friendsListContainer = document.getElementById('friends-list-container');
        friendsListContainer.innerHTML = '';

        if (this.currentUser.friends.length === 0) {
            friendsListContainer.innerHTML = '<div class="text-center">No friends yet</div>';
            return;
        }

        this.currentUser.friends.forEach(friendId => {
            const friend = this.users.find(user => user.id === friendId);
            if (!friend) return;

            const friendElement = document.createElement('div');
            friendElement.className = 'friend-item';
            friendElement.innerHTML = `
                <div class="friend-avatar">${this.getInitials(friend.name)}</div>
                <div class="friend-name">${friend.name}</div>
                <div class="friend-actions">
                    <button class="remove-friend-btn" data-user-id="${friend.id}">Remove</button>
                </div>
            `;

            friendsListContainer.appendChild(friendElement);

            // Add event listener for remove button
            const removeBtn = friendElement.querySelector('.remove-friend-btn');
            removeBtn.addEventListener('click', () => this.removeFriend(friend.id));
        });
    }

    renderFriendSuggestions() {
        const suggestionsContainer = document.getElementById('friend-suggestions-container');
        suggestionsContainer.innerHTML = '';

        // Get users who are not friends and not the current user
        const suggestions = this.users.filter(user => 
            user.id !== this.currentUser.id && 
            !this.currentUser.friends.includes(user.id)
        );

        if (suggestions.length === 0) {
            suggestionsContainer.innerHTML = '<div class="text-center">No suggestions available</div>';
            return;
        }

        // Limit to 5 suggestions
        const limitedSuggestions = suggestions.slice(0, 5);

        limitedSuggestions.forEach(user => {
            // Check if there's a pending request
            const pendingRequest = this.friendRequests.find(
                req => req.senderId === this.currentUser.id && 
                      req.receiverId === user.id &&
                      req.status === 'pending'
            );

            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'friend-suggestion';
            suggestionElement.innerHTML = `
                <div class="suggestion-avatar">${this.getInitials(user.name)}</div>
                <div class="suggestion-name">${user.name}</div>
                <button class="add-friend-btn" data-user-id="${user.id}" ${pendingRequest ? 'disabled' : ''}>
                    ${pendingRequest ? 'Requested' : 'Add Friend'}
                </button>
            `;

            suggestionsContainer.appendChild(suggestionElement);

            // Add event listener for add friend button
            if (!pendingRequest) {
                const addBtn = suggestionElement.querySelector('.add-friend-btn');
                addBtn.addEventListener('click', () => this.sendFriendRequest(user.id));
            }
        });
    }

    renderProfilePage() {
        // Update profile information
        document.getElementById('profile-avatar').textContent = this.getInitials(this.currentUser.name);
        document.getElementById('profile-name').textContent = this.currentUser.name;
        document.getElementById('profile-email').textContent = this.currentUser.email;

        // Update stats
        const userPosts = this.posts.filter(post => post.userId === this.currentUser.id);
        document.getElementById('posts-count').textContent = userPosts.length;
        document.getElementById('friends-count').textContent = this.currentUser.friends.length;

        // Calculate total likes received
        let totalLikes = 0;
        userPosts.forEach(post => {
            totalLikes += post.likes.length;
        });
        document.getElementById('likes-count').textContent = totalLikes;

        // Render user's posts
        this.renderPosts('user');
    }

    renderFriendsPage() {
        this.renderAllFriends();
        this.renderFriendRequests();
    }

    renderAllFriends() {
        const allFriendsContainer = document.getElementById('all-friends-container');
        allFriendsContainer.innerHTML = '';

        if (this.currentUser.friends.length === 0) {
            allFriendsContainer.innerHTML = '<div class="text-center">You have no friends yet</div>';
            return;
        }

        this.currentUser.friends.forEach(friendId => {
            const friend = this.users.find(user => user.id === friendId);
            if (!friend) return;

            const friendElement = document.createElement('div');
            friendElement.className = 'friend-suggestion';
            friendElement.innerHTML = `
                <div class="suggestion-avatar">${this.getInitials(friend.name)}</div>
                <div class="suggestion-name">${friend.name}</div>
                <button class="add-friend-btn" data-user-id="${friend.id}" style="background-color: #e41e3f;">
                    Remove Friend
                </button>
            `;

            allFriendsContainer.appendChild(friendElement);

            // Add event listener for remove button
            const removeBtn = friendElement.querySelector('.add-friend-btn');
            removeBtn.addEventListener('click', () => this.removeFriend(friend.id));
        });
    }

    renderFriendRequests() {
        const requestsContainer = document.getElementById('friend-requests-container');
        requestsContainer.innerHTML = '';

        // Get pending friend requests for current user
        const pendingRequests = this.friendRequests.filter(
            req => req.receiverId === this.currentUser.id && req.status === 'pending'
        );

        if (pendingRequests.length === 0) {
            requestsContainer.innerHTML = '<div class="text-center">No pending friend requests</div>';
            return;
        }

        pendingRequests.forEach(request => {
            const sender = this.users.find(user => user.id === request.senderId);
            if (!sender) return;

            const requestElement = document.createElement('div');
            requestElement.className = 'friend-suggestion';
            requestElement.innerHTML = `
                <div class="suggestion-avatar">${this.getInitials(sender.name)}</div>
                <div class="suggestion-name">${sender.name}</div>
                <div class="flex gap-10">
                    <button class="add-friend-btn accept-btn" data-request-id="${request.id}" style="background-color: #4CAF50;">
                        Accept
                    </button>
                    <button class="add-friend-btn reject-btn" data-request-id="${request.id}" style="background-color: #e41e3f;">
                        Reject
                    </button>
                </div>
            `;

            requestsContainer.appendChild(requestElement);

            // Add event listeners for accept/reject buttons
            const acceptBtn = requestElement.querySelector('.accept-btn');
            const rejectBtn = requestElement.querySelector('.reject-btn');

            acceptBtn.addEventListener('click', () => this.acceptFriendRequest(request.id));
            rejectBtn.addEventListener('click', () => this.rejectFriendRequest(request.id));
        });
    }

    handleSearch(query) {
        if (query.trim()) {
            this.renderPosts(query);
        } else {
            this.renderPosts();
        }
    }

    // Utility Methods
    getInitials(name) {
        if (!name) return '';
        return name.split(' ')
            .map(part => part.charAt(0))
            .join('')
            .toUpperCase();
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffSec = Math.floor(diffMs / 1000);
        const diffMin = Math.floor(diffSec / 60);
        const diffHour = Math.floor(diffMin / 60);
        const diffDay = Math.floor(diffHour / 24);

        if (diffSec < 60) {
            return 'Just now';
        } else if (diffMin < 60) {
            return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
        } else if (diffHour < 24) {
            return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
        } else if (diffDay < 7) {
            return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    showToast(message, type = 'success') {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.className = `toast ${type} show`;

        setTimeout(() => {
            toast.className = toast.className.replace('show', '');
        }, 3000);
    }
}
document.addEventListener('DOMContentLoaded', function() {
    const heart = document.getElementById('footer-heart');
    heart.addEventListener('mouseenter', function() {
      heart.classList.add('animated');
    });
    heart.addEventListener('mouseleave', function() {
      heart.classList.remove('animated');
    });
  });
  



// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const app = new SocialMediaApp();
});
