
const postButton = document.querySelector("button");
const postInput = document.querySelector("textarea");
const feed = document.querySelector(".feed");

postButton.addEventListener("click", function () {
    const postText = postInput.value.trim();

    if (postText === "") {
        alert("Please write something first!");
        return;
    }

    const post = document.createElement("div");
    post.style.background = "#f0f2f5";
    post.style.padding = "15px";
    post.style.marginTop = "15px";
    post.style.borderRadius = "10px";

    post.textContent = postText;

    feed.appendChild(post);
    postInput.value = "";
});
