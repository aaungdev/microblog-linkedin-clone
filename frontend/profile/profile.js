"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const token = getLoginData().token;
  const username = getLoginData().username;

  if (!token || !username) {
    window.location.replace("../account/login.html");
    return;
  }

  const fullNameElement = document.getElementById("fullName");
  const bioElement = document.getElementById("bio");

  const modal = document.getElementById("editProfileModal");
  const span = document.getElementsByClassName("close")[0];
  const editFullNameBtn = document.getElementById("editFullNameBtn");
  const editProfileForm = document.getElementById("editProfileForm");
  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const headline = document.getElementById("headline");

  fetchUserDetails(username, token).then((user) => {
    fullNameElement.textContent = user.fullName || "No name provided";
    bioElement.textContent = user.bio || "No bio provided";
    updateDropdownUserDetails(user);
  });

  fetchUserPosts(username, token);

  editFullNameBtn.addEventListener("click", async () => {
    modal.style.display = "block";
    const fullName = fullNameElement.textContent.trim();
    const [first, ...last] = fullName.split(" ");
    firstName.value = first || "";
    lastName.value = last.join(" ") || "";
    headline.value = bioElement.textContent.trim();
  });

  span.addEventListener("click", () => {
    modal.style.display = "none";
  });

  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  editProfileForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const updatedFirstName = firstName.value.trim();
    const updatedLastName = lastName.value.trim();
    const updatedFullName = `${updatedFirstName} ${updatedLastName}`;
    const updatedHeadline = headline.value.trim();

    if (updatedFullName && updatedHeadline) {
      try {
        const updatedUser = await updateUserDetails(
          username,
          updatedFullName,
          updatedHeadline,
          token
        );
        fullNameElement.textContent = updatedUser.fullName;
        bioElement.textContent = updatedUser.bio;
        updateDropdownUserDetails(updatedUser);
        modal.style.display = "none";
      } catch (error) {
        console.error("Error updating profile:", error);
      }
    } else {
      alert("Full Name and Headline cannot be empty!");
    }
  });
});

async function fetchUserDetails(username, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching user details:", error);
  }
}

async function updateUserDetails(username, fullName, bio, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fullName: fullName,
          bio: bio,
        }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update profile");
    }

    return await response.json();
  } catch (error) {
    console.error("Error updating user details:", error);
    throw error;
  }
}

async function fetchUserPosts(username, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/posts`,
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
    const userPosts = posts.filter((post) => post.username === username);
    displayUserPosts(userPosts, token, username);
  } catch (error) {
    console.error("Error fetching posts:", error);
  }
}

function displayUserPosts(posts, token, username) {
  const postsContainer = document.querySelector(".postsContainer");

  if (!postsContainer) {
    console.error("Posts container element not found");
    return;
  }

  postsContainer.innerHTML = "";

  posts.forEach(async (post) => {
    const postElement = document.createElement("article");
    postElement.classList.add("post");

    const postDate = new Date(post.createdAt);
    const now = new Date();
    const timeDiff = Math.abs(now - postDate);
    const isRecent = timeDiff < 24 * 60 * 60 * 1000;

    const formattedDate = isRecent
      ? postDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      : postDate.toLocaleDateString([], { month: "short", day: "numeric" });

    const postAuthor = `
      <article class="postAuthor">
          <img src="../images/user.png" alt="User">
          <article>
              <h1>${post.username}</h1>
              <p>${await fetchUserBio(post.username, token)}</p>
              <small><i class="bi bi-globe"></i> ${formattedDate}</small>
          </article>
          <div class="customPostOptions">
              <button class="customOptionsBtn"><i class="bi bi-three-dots"></i></button>
              <button class="customCloseBtn"><i class="bi bi-x"></i></button>
              <div class="customDropdownMenu">
                  <a href="#"><i class="bi bi-bookmark"></i> Save</a>
                  <a href="#"><i class="bi bi-link-45deg"></i> Copy link to post</a>
                  <a href="#"><i class="bi bi-eye-slash"></i> Not interested</a>
                  <a href="#"><i class="bi bi-person-x"></i> Unfollow</a>
                  <a href="#"><i class="bi bi-flag"></i> Report post</a>
              </div>
          </div>
      </article>`;

    const postContent = `<p>${post.text}</p>`;
    const postImage = post.image
      ? `<img src="${post.image}" alt="Post Image" width="100%">`
      : "";

    const like = post.likes.find((like) => like.username === username);
    const isLiked = !!like;

    const postStats = `
      <article class="postStats">
          <article>
              <img src="../images/like.svg" alt="Like">
              <img src="../images/love.svg" alt="Love">
              <img src="../images/celebrate.svg" alt="Celebrate">
              <img src="../images/support.svg" alt="Support">
              <img src="../images/insightful.svg" alt="Insightful">
              <img src="../images/funny.svg" alt="funny">
              <span class="likedUser">${post.likes.length} likes</span>
          </article>
          ${
            post.comments || post.shares
              ? `<article>
              ${post.comments ? `<span>${post.comments} comments</span>` : ""}
              ${
                post.shares
                  ? `<b>&nbsp;-&nbsp;</b> <span>${post.shares} shares</span>`
                  : ""
              }
          </article>`
              : ""
          }
      </article>`;

    const postActivity = `
      <article class="postActivity">
          <article class="postActivityLink like-button ${
            isLiked ? "liked" : ""
          }" data-post-id="${post._id}" data-like-id="${
      isLiked ? like._id : ""
    }">
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
    postsContainer.appendChild(postElement);
  });

  document.querySelectorAll(".like-button").forEach((button) => {
    button.addEventListener("click", (event) =>
      toggleLike(event, token, username)
    );
  });

  document.querySelectorAll(".customOptionsBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const postElement = event.currentTarget.closest(".post");
      const dropdownMenu = postElement.querySelector(".customDropdownMenu");
      dropdownMenu.classList.toggle("show");
    });
  });

  document.querySelectorAll(".customCloseBtn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const postElement = event.currentTarget.closest(".post");
      postElement.remove();
    });
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".customOptionsBtn")) {
      document.querySelectorAll(".customDropdownMenu").forEach((menu) => {
        menu.classList.remove("show");
      });
    }
  });
}

async function toggleLike(event, token, username) {
  const postId = event.currentTarget.dataset.postId;
  const likeId = event.currentTarget.dataset.likeId;
  const likeButton = event.currentTarget;
  const isLiked = likeButton.classList.contains("liked");

  try {
    if (isLiked) {
      await removeLike(likeId, token);
      likeButton.classList.remove("liked");
      likeButton.dataset.likeId = "";
    } else {
      const newLikeId = await addLike(postId, token);
      likeButton.classList.add("liked");
      likeButton.dataset.likeId = newLikeId;
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }

  fetchUserPosts(username, token);
}

async function addLike(postId, token) {
  try {
    const response = await fetch(
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

    if (!response.ok) {
      throw new Error("Failed to add like");
    }

    const result = await response.json();
    return result._id;
  } catch (error) {
    console.error("Error adding like:", error);
  }
}

async function removeLike(likeId, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/likes/${likeId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to remove like");
    }
  } catch (error) {
    console.error("Error removing like:", error);
  }
}

async function fetchUserBio(username, token) {
  try {
    const response = await fetch(
      `http://microbloglite.us-east-2.elasticbeanstalk.com/api/users/${username}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch user bio");
    }

    const user = await response.json();
    const bio = user.bio || "Yearup Student";
    return bio.length > 50 ? bio.substring(0, 50) + "..." : bio;
  } catch (error) {
    console.error("Error fetching user bio:", error);
    return "Yearup Student";
  }
}

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

function toggleMenu() {
  const dropdownMenu = document.getElementById("dropdownMenu");
  dropdownMenu.classList.toggle("show");
}

window.onclick = function (event) {
  if (
    !event.target.matches(".online img") &&
    !event.target.closest(".dropdownMenu")
  ) {
    const dropdownMenu = document.getElementById("dropdownMenu");
    if (dropdownMenu.classList.contains("show")) {
      dropdownMenu.classList.remove("show");
    }
  }
};

document
  .getElementById("viewProfileButton")
  .addEventListener("click", function () {
    window.location.href = "profile.html";
  });

document
  .getElementById("logoutButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    logout();
  });

function logout() {
  window.localStorage.removeItem("login-data");
  window.location.href = "../account/login.html";
}

function updateDropdownUserDetails(user) {
  const dropdownFullNameElement = document.querySelector(
    ".dropdownMenu .profileInfo h4"
  );
  const dropdownBioElement = document.querySelector(
    ".dropdownMenu .profileInfo p"
  );
  dropdownFullNameElement.textContent = user.fullName || "No name provided";
  dropdownBioElement.textContent = user.bio || "No bio provided";
}
