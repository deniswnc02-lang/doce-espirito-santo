/* ============================================================
   DOCE ESPÍRITO SANTO
   APPLICATION LOGIC
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  /* ==========================================================
     STATE
  ========================================================== */

  let currentDay =
    Number(localStorage.getItem("doceEspíritoDay")) || 0;

  const totalDays = 365;


  /* ==========================================================
     ELEMENTS
  ========================================================== */

  const pages =
    document.querySelectorAll(".page");

  const navItems =
    document.querySelectorAll(".nav-item");

  const startJourney =
    document.getElementById("startJourney");

  const continueDevotional =
    document.getElementById("continueDevotional");

  const journeyButton =
    document.getElementById("journeyButton");

  const studiesButton =
    document.getElementById("studiesButton");

  const profileButton =
    document.getElementById("profileButton");

  const profileContinue =
    document.getElementById("profileContinue");

  const completeDay =
    document.getElementById("completeDay");

  const searchButton =
    document.getElementById("searchButton");

  const searchModal =
    document.getElementById("searchModal");

  const closeSearch =
    document.getElementById("closeSearch");

  const searchInput =
    document.getElementById("searchInput");

  const searchResults =
    document.getElementById("searchResults");


  /* ==========================================================
     PAGE NAVIGATION
  ========================================================== */

  function showPage(pageId) {

    pages.forEach(page => {

      page.classList.toggle(
        "active",
        page.id === pageId
      );

    });


    navItems.forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === pageId
      );

    });


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }


  /* ==========================================================
     NAV BUTTONS
  ========================================================== */

  navItems.forEach(item => {

    item.addEventListener("click", () => {

      const pageId =
        item.dataset.page;

      showPage(pageId);

    });

  });


  /* ==========================================================
     BACK BUTTON
  ========================================================== */

  document
    .querySelectorAll("[data-back]")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => showPage("homePage")
      );

    });


  /* ==========================================================
     START JOURNEY
  ========================================================== */

  startJourney.addEventListener(
    "click",
    () => {

      if (currentDay === 0) {

        openDevotional(1);

      } else {

        openDevotional(currentDay + 1);

      }

    }
  );


  /* ==========================================================
     DEVOTIONAL
  ========================================================== */

  function openDevotional(day) {

    const safeDay =
      Math.max(
        1,
        Math.min(totalDays, day)
      );

    document.getElementById(
      "readingDay"
    ).textContent = safeDay;

    document.getElementById(
      "readingTitle"
    ).textContent =
      getDevotionalTitle(safeDay);

    showPage("devotionalPage");

  }


  continueDevotional.addEventListener(
    "click",
    () => {

      openDevotional(
        Math.max(1, currentDay + 1)
      );

    }
  );


  /* ==========================================================
     COMPLETE DAY
  ========================================================== */

  completeDay.addEventListener(
    "click",
    () => {

      const readingDay =
        Number(
          document.getElementById(
            "readingDay"
          ).textContent
        );

      if (
        readingDay > currentDay &&
        readingDay <= totalDays
      ) {

        currentDay = readingDay;

        localStorage.setItem(
          "doceEspíritoDay",
          currentDay
        );

      }

      updateProgress();

      showPage("homePage");

    }
  );


  /* ==========================================================
     JOURNEY
  ========================================================== */

  journeyButton.addEventListener(
    "click",
    () => showPage("journeyPage")
  );


  /* ==========================================================
     STUDIES
  ========================================================== */

  studiesButton.addEventListener(
    "click",
    () => showPage("studiesPage")
  );


  /* ==========================================================
     PROFILE
  ========================================================== */

  profileButton.addEventListener(
    "click",
    () => showPage("profilePage")
  );


  profileContinue.addEventListener(
    "click",
    () => {

      openDevotional(
        Math.max(1, currentDay + 1)
      );

    }
  );


  /* ==========================================================
     SEARCH
  ========================================================== */

  searchButton.addEventListener(
    "click",
    () => {

      searchModal.classList.add("active");

      setTimeout(() => {
        searchInput.focus();
      }, 100);

    }
  );


  closeSearch.addEventListener(
    "click",
    closeSearchModal
  );


  searchModal.addEventListener(
    "click",
    event => {

      if (
        event.target === searchModal
      ) {

        closeSearchModal();

      }

    }
  );


  function closeSearchModal() {

    searchModal.classList.remove(
      "active"
    );

    searchInput.value = "";

    searchResults.innerHTML = "";

  }


  /* ==========================================================
     SEARCH DATA
  ========================================================== */

  const searchData = [

    {
      title: "A Presença que já está aqui",
      category: "Devocional",
      day: 1
    },

    {
      title: "Tempo com Ele",
      category: "Práticas de presença"
    },

    {
      title: "Escuta e Sensibilidade",
      category: "Práticas de presença"
    },

    {
      title: "Silêncio e Contemplação",
      category: "Práticas de presença"
    },

    {
      title: "O Espírito Santo no Antigo Testamento",
      category: "Estudo teológico"
    },

    {
      title: "A promessa de Jesus",
      category: "Estudo teológico"
    },

    {
      title: "Pentecostes",
      category: "Estudo teológico"
    }

  ];


  searchInput.addEventListener(
    "input",
    () => {

      const query =
        searchInput.value
          .toLowerCase()
          .trim();


      if (!query) {

        searchResults.innerHTML = "";

        return;

      }


      const results =
        searchData.filter(item =>
          item.title
            .toLowerCase()
            .includes(query)
        );


      if (!results.length) {

        searchResults.innerHTML = `
          <div class="search-result">
            <small>Nenhum resultado encontrado.</small>
          </div>
        `;

        return;

      }


      searchResults.innerHTML =
        results
          .map(item => `
            <div
              class="search-result"
              data-day="${item.day || ""}"
            >
              <strong>
                ${item.title}
              </strong>

              <small>
                ${item.category}
              </small>
            </div>
          `)
          .join("");


      document
        .querySelectorAll(
          ".search-result[data-day]"
        )
        .forEach(result => {

          result.addEventListener(
            "click",
            () => {

              const day =
                Number(
                  result.dataset.day
                );

              closeSearchModal();

              openDevotional(day);

            }
          );

        });

    }
  );


  /* ==========================================================
     CONTENT CARDS
  ========================================================== */

  document
    .querySelectorAll(".content-card")
    .forEach(card => {

      card.addEventListener(
        "click",
        () => {

          const title =
            card.dataset.title;

          const description =
            card.dataset.description;

          alert(
            `${title}\n\n${description}`
          );

        }
      );

    });


  /* ==========================================================
     SEE ALL
  ========================================================== */

  document
    .querySelectorAll(".see-all")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          alert(
            "Aqui entraremos na biblioteca completa de conteúdos."
          );

        }
      );

    });


  /* ==========================================================
     DEVOTIONAL TITLES
  ========================================================== */

  function getDevotionalTitle(day) {

    const titles = {

      1:
        "A Presença que já está aqui",

      2:
        "Antes de procurar, perceba",

      3:
        "O Deus que decidiu permanecer",

      4:
        "Aprendendo a reconhecer a presença",

      5:
        "Quando o silêncio também fala",

      6:
        "A presença que não depende da emoção",

      7:
        "O Consolador prometido"

    };


    return (
      titles[day] ||
      `A jornada da presença — Dia ${day}`
    );

  }


  /* ==========================================================
     PROGRESS
  ========================================================== */

  function updateProgress() {

    const percent =
      (currentDay / totalDays) * 100;


    document.getElementById(
      "dayNumber"
    ).textContent =
      `Dia ${Math.max(1, currentDay)} de 365`;


    document.getElementById(
      "journeyDay"
    ).textContent =
      currentDay;


    document.getElementById(
      "circleDay"
    ).textContent =
      currentDay;


    document.getElementById(
      "profileDay"
    ).textContent =
      currentDay;


    document.getElementById(
      "profilePercent"
    ).textContent =
      `${percent.toFixed(1)}%`;


    document.getElementById(
      "journeyBar"
    ).style.width =
      `${percent}%`;


    document.getElementById(
      "miniProgress"
    ).style.width =
      `${percent}%`;

  }


  /* ==========================================================
     KEYBOARD
  ========================================================== */

  document.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Escape" &&
        searchModal.classList.contains("active")
      ) {

        closeSearchModal();

      }

    }
  );


  /* ==========================================================
     INITIALIZE
  ========================================================== */

  updateProgress();

});
