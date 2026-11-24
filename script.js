
/* =================================
   WEPEN SOCIAL MEDIA
   JavaScript Version 2.0
================================= */

const postForm = document.getElementById("postForm");
const postText = document.getElementById("postText");
const postsContainer = document.getElementById("postsContainer");

const STORAGE_KEY = "wepen_posts_v2";

const reactions = {
    Like: "👍",
    Love: "❤️",
    Care: "🥰",
    Haha: "😂",
    Wow: "😮",
    Sad: "😢",
    Angry: "😡"
};

// Load saved posts
let posts = [];

try {
    const saved = JSON.parse(
        localStorage.getItem(STORAGE_KEY) || "[]"
    );

    posts = Array.isArray(saved) ? saved : [];
} catch (error) {
    posts = [];
}

// Generate ID
function generateId() {
    return Date.now().toString(36) +
        Math.random().toString(36).slice(2);
}

// Save data
function savePosts() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(posts)
        );
    } catch (error) {
        alert("Could not save data in this browser.");
    }
}

// Create element
function createElement(tag, text, className) {
    const element = document.createElement(tag);

    if (text !== undefined) {
        element.textContent = text;
    }

    if (className) {
        element.className = className;
    }

    return element;
}

// Create button
function createButton(text, callback) {
    const button = createElement("button", text);

    button.type = "button";
    button.style.cssText = `
        padding: 8px 12px;
        margin: 4px;
        border: none;
        border-radius: 8px;
        background: #e7f0ff;
        color: #1877f2;
        cursor: pointer;
    `;

    button.addEventListener("click", callback);

    return button;
}

// Format time
function formatTime(timestamp) {
    return new Date(timestamp).toLocaleString();
}

// Count reactions
function countReactions(reactionData) {
    const counts = {};

    Object.values(reactionData || {}).forEach(type => {
        counts[type] = (counts[type] || 0) + 1;
    });

    return counts;
}

// Create reaction buttons
function addReactionButtons(container, data, onReact) {

    const reactionButtons = createElement("div");

    reactionButtons.style.cssText = `
        display: flex;
        flex-wrap: wrap;
        gap: 3px;
        margin: 10px 0;
    `;

    Object.entries(reactions).forEach(([name, emoji]) => {

        const count = countReactions(data)[name] || 0;

        const button = createButton(
            `${emoji} ${name} ${count || ""}`,
            () => onReact(name)
        );

        if (data.currentUser === name) {
            button.style.background = "#cfe2ff";
        }

        reactionButtons.appendChild(button);
    });

    container.appendChild(reactionButtons);
}

// Create Post
postForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const text = postText.value.trim();

    if (!text) {
        alert("Please write something!");
        return;
    }

    const newPost = {
        id: generateId(),
        text: text,
        time: Date.now(),
        reactions: {},
        comments: [],
        saved: false
    };

    posts.unshift(newPost);

    savePosts();
    renderPosts();

    postText.value = "";
});

// Render all posts
function renderPosts() {

    postsContainer.replaceChildren();

    if (posts.length === 0) {
        postsContainer.appendChild(
            createElement("p", "No posts yet. Be the first to post!")
        );
        return;
    }

    posts.forEach(post => {

        const card = createElement("article");

        card.style.cssText = `
            background: #f8f9fa;
            padding: 18px;
            margin-bottom: 18px;
            border-radius: 12px;
            border: 1px solid #ddd;
        `;

        // Author
        const author = createElement("h4", "👤 WEPEN User");

        card.appendChild(author);

        // Time
        const time = createElement(
            "small",
            formatTime(post.time)
        );

        time.style.color = "#777";
        card.appendChild(time);

        // Post text
        const content = createElement("p", post.text);

        content.style.cssText = `
            margin: 15px 0;
            white-space: pre-wrap;
            overflow-wrap: anywhere;
        `;

        card.appendChild(content);

        // Reaction summary
        const summary = createElement("p");

        const reactionCounts = countReactions(post.reactions);

        summary.textContent = Object.entries(reactionCounts)
            .map(([name, count]) =>
                `${reactions[name]} ${count}`
            )
            .join("   ") || "No reactions yet";

        summary.style.color = "#65676b";

        card.appendChild(summary);

        // Post reactions
        addReactionButtons(
            card,
            post.reactions,
            function(type) {

                if (post.reactions[type] === type) {
                    delete post.reactions[type];
                } else {
                    post.reactions[type] = type;
                }

                savePosts();
                renderPosts();
            }
        );

        // Save Post
        const saveButton = createButton(
            post.saved ? "🔖 Saved" : "🔖 Save Post",
            function() {
                post.saved = !post.saved;
                savePosts();
                renderPosts();
            }
        );

        card.appendChild(saveButton);

        // Delete Post
        const deleteButton = createButton(
            "🗑 Delete Post",
            function() {

                if (confirm("Delete this post?")) {
                    posts = posts.filter(
                        item => item.id !== post.id
                    );

                    savePosts();
                    renderPosts();
                }
            }
        );

        card.appendChild(deleteButton);

        // Comment heading
        const commentHeading = createElement(
            "h4",
            `Comments (${post.comments.length})`
        );

        commentHeading.style.marginTop = "18px";

        card.appendChild(commentHeading);

        // Comment form
        const commentForm = createElement("form");

        const commentInput = createElement("input");

        commentInput.type = "text";
        commentInput.placeholder = "Write a comment...";
        commentInput.maxLength = 500;
        commentInput.required = true;

        commentInput.style.cssText = `
            width: 70%;
            padding: 11px;
            border: 1px solid #ccc;
            border-radius: 8px;
            margin: 8px 0;
        `;

        const commentSubmit = createElement(
            "button",
            "Comment"
        );

        commentSubmit.type = "submit";

        commentForm.appendChild(commentInput);
        commentForm.appendChild(commentSubmit);

        commentForm.addEventListener("submit", function(event) {

            event.preventDefault();

            const text = commentInput.value.trim();

            if (!text) return;

            post.comments.push({
                id: generateId(),
                text: text,
                time: Date.now(),
                reactions: {},
                replies: []
            });

            savePosts();
            renderPosts();
        });

        card.appendChild(commentForm);

        // Render comments
        post.comments.forEach(comment => {

            const commentBox = createElement("div");

            commentBox.style.cssText = `
                background: white;
                padding: 12px;
                margin-top: 12px;
                border-radius: 10px;
                border: 1px solid #eee;
            `;

            // Comment text
            const commentText = createElement(
                "p",
                "👤 User: " + comment.text
            );

            commentText.style.overflowWrap = "anywhere";

            commentBox.appendChild(commentText);

            // Comment reactions
            const commentReactionTitle = createElement(
                "small",
                "React to comment"
            );

            commentReactionTitle.style.color = "#777";

            commentBox.appendChild(commentReactionTitle);

            const commentCounts = countReactions(
                comment.reactions
            );

            const commentSummary = createElement(
                "p",
                Object.entries(commentCounts)
                    .map(([name, count]) =>
                        `${reactions[name]} ${count}`
                    )
                    .join("   ") || "No reactions"
            );

            commentBox.appendChild(commentSummary);

            addReactionButtons(
                commentBox,
                comment.reactions,
                function(type) {

                    if (comment.reactions[type] === type) {
                        delete comment.reactions[type];
                    } else {
                        comment.reactions[type] = type;
                    }

                    savePosts();
                    renderPosts();
                }
            );

            // Reply form
            const replyForm = createElement("form");

            const replyInput = createElement("input");

            replyInput.type = "text";
            replyInput.placeholder = "Write a reply...";
            replyInput.maxLength = 500;
            replyInput.required = true;

            replyInput.style.cssText = `
                width: 65%;
                padding: 9px;
                border: 1px solid #ccc;
                border-radius: 8px;
            `;

            const replyButton = createElement(
                "button",
                "Reply"
            );

            replyButton.type = "submit";

            replyForm.appendChild(replyInput);
            replyForm.appendChild(replyButton);

            replyForm.addEventListener("submit", function(event) {

                event.preventDefault();

                const text = replyInput.value.trim();

                if (!text) return;

                comment.replies.push({
                    id: generateId(),
                    text: text,
                    time: Date.now()
                });

                savePosts();
                renderPosts();
            });

            commentBox.appendChild(replyForm);

            // Replies
            const repliesTitle = createElement(
                "p",
                `↳ Replies (${comment.replies.length})`
            );

            repliesTitle.style.cssText = `
                margin-top: 12px;
                font-weight: bold;
                color: #1877f2;
            `;

            commentBox.appendChild(repliesTitle);

            comment.replies.forEach(reply => {

                const replyItem = createElement(
                    "p",
                    "↳ User: " + reply.text
                );

                replyItem.style.cssText = `
                    background: #f0f2f5;
                    padding: 10px;
                    margin: 6px 0 0 15px;
                    border-radius: 8px;
                    overflow-wrap: anywhere;
                `;

                commentBox.appendChild(replyItem);
            });

            card.appendChild(commentBox);
        });

        postsContainer.appendChild(card);
    });
}

// Start WEPEN
renderPosts();

console.log("WEPEN Version 2.0 loaded!");
