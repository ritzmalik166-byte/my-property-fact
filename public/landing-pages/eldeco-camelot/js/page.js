
        const enquiryBox = document.querySelector(".enquiry-box");
        const toggleIcon = document.querySelector(".toggle-form");
        const header = document.querySelector(".enquiry-header");

        // Only run if elements exist
        if (enquiryBox && toggleIcon && header) {
            // Manual toggle on header click
            header.onclick = () => {
                enquiryBox.classList.toggle("collapsed");
                toggleIcon.classList.toggle("fa-chevron-down");
                toggleIcon.classList.toggle("fa-chevron-up");
            };

            let lastScroll = window.scrollY;

            window.addEventListener("scroll", () => {
                let currentScroll = window.scrollY;

                // Scroll Down â†' Collapse form
                if (currentScroll > lastScroll) {
                    enquiryBox.classList.add("collapsed");
                    toggleIcon.classList.remove("fa-chevron-down");
                    toggleIcon.classList.add("fa-chevron-up");
                }

                // Only when near top â†' Expand form
                if (currentScroll < 100) {
                    enquiryBox.classList.remove("collapsed");
                    toggleIcon.classList.remove("fa-chevron-up");
                    toggleIcon.classList.add("fa-chevron-down");
                }

                lastScroll = currentScroll;
            });
        }




       
        $(document).ready(function () {
            var owl = $(".banner-slider").owlCarousel({
                loop: true,
                margin: 20,
                autoplay: true,
                autoplayTimeout: 2500,
                autoplayHoverPause: false,
                center: true,
                smartSpeed: 700,
                responsive: {
                    0: { items: 1 },
                    768: { items: 2 },
                    1200: { items: 3 }
                }
            });

            $(".left-nav").click(function () {
                owl.trigger("prev.owl.carousel");
            });
            $(".right-nav").click(function () {
                owl.trigger("next.owl.carousel");
            });
        });


        $(document).ready(function () {
            var gallery = $(".gallery-slider").owlCarousel({
                items: 3,
                margin: 20,
                loop: true,
                autoplay: true,
                autoplayTimeout: 2000,
                autoplayHoverPause: true,
                smartSpeed: 800,
                dots: false,
                nav: false,
                responsive: {
                    0: { items: 1 },
                    600: { items: 2 },
                    1000: { items: 3 }
                }
            });

            // Custom Navigation
            $('.gallery-nav-prev').click(function () {
                gallery.trigger('prev.owl.carousel');
            });

            $('.gallery-nav-next').click(function () {
                gallery.trigger('next.owl.carousel');
            });
        });


        $('.amenities-carousel').owlCarousel({
            loop: true,
            margin: 20,
            autoplay: true,
            autoplayTimeout: 3000,
            smartSpeed: 700,
            dots: false,
            nav: false,
            responsive: {
                0: { items: 1 },
                576: { items: 1 },
                768: { items: 2 },
                992: { items: 2 }
            }
        });

   
    document.addEventListener("DOMContentLoaded", function () {
        setTimeout(function () {
            var myModal = new bootstrap.Modal(document.getElementById('contactModal'));
            myModal.show();
        }, 2000); // 2 seconds
    });