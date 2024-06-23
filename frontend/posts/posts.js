"use strict";

const token =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFsZXgxMjM0IiwiaWF0IjoxNzE5MTU3NDkwLCJleHAiOjE3MTkyNDM4OTB9.bNlxL8YTydqW-g3fHPvvpGvtmRDSjksSkHR_mbdb49A";

async function fetchPosts() {
  try {
    const response = await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts",
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch posts");
    }

    const posts = await response.json();
    displayPosts(posts);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayPosts(posts) {
  const mainContent = document.querySelector(".mainContent");
  mainContent.innerHTML = "";

  posts.forEach((post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const postAuthor = `
            <article class="postAuthor">
                <img src="img/user-3.png" alt="User">
                <article>
                    <h1>${post.username}</h1>
                    <small>${post.bio || ""}</small>
                    <small>${new Date(
                      post.createdAt
                    ).toLocaleTimeString()}</small>
                </article>
            </article>`;

    const postContent = `<p>${post.text}</p>`;
    const postImage = post.image
      ? `<img src="${post.image}" alt="Post Image" width="100%">`
      : "";

    const postStats = `
            <article class="postStats">
                <article>
                    <img src="frontend/posts/images/like.svg" alt="Like">
                    <img src="frontend/posts/images/love.svg" alt="Love">
                    <img src="frontend/posts/images/celebrate.svg" alt="Celebrate">
                    <img src="frontend/posts/images/support.svg" alt="Support">
                    <img src="frontend/posts/images/insightful.svg" alt="Insightful">
                    <img src="frontend/posts/images/funny.svg" alt="funny">
                    <span class="likedUser">${post.likes.length} likes</span>
                    </article>
                <article>
                    <span>${
                      post.comments || 0
                    } comments</span> <b>&nbsp;-&nbsp;</b> <span>${
      post.shares || 0
    } shares</span>
                </article>
            </article>`;

    const postActivity = `
            <article class="postActivity">
                <article class="postActivityLink like-button" data-post-id="${post._id}">
                    <i class='bx bx-like bx-flip-horizontal'></i>&nbsp;<span>Like</span>
                </article>
                <article class="postActivityLink">
                    <i class='bx bx-comment-detail'></i>&nbsp;<span>Comment</span>
                </article>
                <article class="postActivityLink">
                    <i class='bx bx-repost'></i>&nbsp;<span>Repost</span>
                </article>
                <article class="postActivityLink">
                    <i class='bx bxs-send'></i>&nbsp;<span>Send</span>
                </article>
            </article>`;

    postElement.innerHTML =
      postAuthor + postContent + postImage + postStats + postActivity;
    mainContent.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", toggleLike);
  });
}

async function toggleLike(event) {
  const postId = event.currentTarget.dataset.postId;
  const likeButton = event.currentTarget;

  if (!likeButton) return;

  const isLiked = likeButton.classList.contains("liked");

  try {
    if (isLiked) {
      await removeLike(postId);
      likeButton.classList.remove("liked");
    } else {
      await addLike(postId);
      likeButton.classList.add("liked");
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }

  fetchPosts();
}

async function addLike(postId) {
  try {
    await fetch(
      "http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ postId }),
      }
    );
  } catch (error) {
    console.error("Error adding like:", error);
  }
}

async function removeLike(postId) {
  try {
    await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${postId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Error removing like:", error);
  }
}

fetchPosts();
