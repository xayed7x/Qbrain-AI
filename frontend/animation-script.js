// animation-script.js
document.addEventListener("DOMContentLoaded", () => {
  // ID of the input field in index.html that triggers the animation
  const triggerInput = document.getElementById("main-ask-input");
  const qbrainOverlay = document.getElementById("qbrain-transition-overlay");

  if (!triggerInput || !qbrainOverlay) {
    console.warn(
      "QBrain AI: Animation trigger or overlay not found on index.html."
    );
    return;
  }

  const leftDoor = document.getElementById("left-door");
  const rightDoor = document.getElementById("right-door");
  const lightEffect = document.getElementById("light-beam-effect");

  function playOpenAnimationAndRedirect() {
    document.body.classList.add("qbrain-transition-active");
    qbrainOverlay.style.display = "block";

    const tl = gsap.timeline();
    const totalDuration = 2.2; // From your final preview

    // Reset elements before animation (important if user navigates back and triggers again)
    tl.set([leftDoor, rightDoor], { opacity: 1, x: "0%", display: "block" });
    tl.set(lightEffect, { opacity: 0, scale: 0.05 });
    // Removed chatbotContainer set as it's not part of this page's direct animation logic

    tl.to(qbrainOverlay, {
      opacity: 1,
      duration: totalDuration * 0.08,
      ease: "power1.in",
    });

    tl.to(
      leftDoor,
      {
        x: "-100%",
        duration: totalDuration * 0.55,
        ease: "power2.inOut",
      },
      ">0.02"
    );

    tl.to(
      rightDoor,
      {
        x: "100%",
        duration: totalDuration * 0.55,
        ease: "power2.inOut",
      },
      "<"
    );

    tl.to(
      lightEffect,
      {
        opacity: 1,
        scale: 1.7,
        duration: totalDuration * 0.7,
        ease: "power1.out",
      },
      "<0.15"
    );

    tl.to(
      [leftDoor, rightDoor],
      {
        opacity: 0,
        duration: totalDuration * 0.18,
        onComplete: () => {
          // Hide doors completely
          if (leftDoor) leftDoor.style.display = "none";
          if (rightDoor) rightDoor.style.display = "none";
        },
      },
      `-=${totalDuration * 0.25}`
    );

    // This is where the main light effect happens, preparing for redirect
    // ...existing code...
    // This is where the main light effect happens, preparing for redirect
    tl.to(
      lightEffect,
      {
        opacity: 1,
        scale: 2.1, // Ensure it fills
        duration: totalDuration * 0.15, // Drastically reduce duration of this phase
        ease: "power1.in", // Accelerate into full white
        onComplete: () => {
          // Short delay to ensure render before redirect, then go.
          // Using a direct call now as the animation is just about becoming white.
          // No need to wait for a long animation to complete.
        },
      },
      `>${totalDuration * 0.05}` // Start this final light flash a bit later
    ).call(
      () => {
        // REDIRECT TO CHAT.HTML immediately after the light flash is set to go
        window.location.href = "chat.html";
      },
      [],
      ">-0.05"
    ); // Call this slightly before the very end of the quick light flash, or at its peak
    // ...existing code...
  }

  triggerInput.addEventListener("focus", (e) => {
    // Using 'focus' as it's an input field
    e.preventDefault();
    playOpenAnimationAndRedirect();
    triggerInput.blur(); // Remove focus from original input
  });
  // You could also use 'click' if preferred:
  // triggerInput.addEventListener('click', (e) => { ... });
});
