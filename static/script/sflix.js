/*
  _____                   _                _     _                                                                      
 |  __ \                 | |              | |   | |                                                                     
 | |__) |   ___    _ __  | |_    ___    __| |   | |__    _   _                                                          
 |  ___/   / _ \  | '__| | __|  / _ \  / _` |   | '_ \  | | | |                                                         
 | |      | (_) | | |    | |_  |  __/ | (_| |   | |_) | | |_| |                                                         
 |_|       \___/  |_|     \__|  \___|  \__,_|   |_.__/   \__, |                                                         
                                                          __/ |                                                         
                                                         |___/                                                          
                                _     _                     _       _   _          _                               _    
     /\                        | |   | |                   | |     | \ | |        | |                             | |   
    /  \     _ __ ___     ___  | |_  | |__    _   _   ___  | |_    |  \| |   ___  | |_  __      __   ___    _ __  | | __
   / /\ \   | '_ ` _ \   / _ \ | __| | '_ \  | | | | / __| | __|   | . ` |  / _ \ | __| \ \ /\ / /  / _ \  | '__| | |/ /
  / ____ \  | | | | | | |  __/ | |_  | | | | | |_| | \__ \ | |_    | |\  | |  __/ | |_   \ V  V /  | (_) | | |    |   < 
 /_/    \_\ |_| |_| |_|  \___|  \__| |_| |_|  \__, | |___/  \__|   |_| \_|  \___|  \__|   \_/\_/    \___/  |_|    |_|\_\
                                               __/ |                                                                    
                                              |___/                                                                     
*/
async function sflix(app) {
    app.search.input.placeholder = 'Search library'
    app.search.back.style.display = 'inline';
    app.search.back.href = '#';

    app.main.library = app.createElement('div', await compileGs(app), {
        style: {
            'margin-bottom': '40px'
        }
    });
    app.main.emptySearch = app.createElement('div', [
        app.createElement('p', 'No results found.')
    ], {
        class: 'gs-empty',
        style: {
            display: 'none'
        }
    });
    app.main.player = app.createElement('div', [
        app.createElement('iframe', [], {
            class: 'gs-frame',
            events: {
                focus(event) {
                    event.target.contentWindow.focus();
                }
            },
            attrs: {
                tabindex: 1,
                src: 'about:blank'
            }
        }),
        app.createElement('p', [], {
            class: 'author'
        }),
        app.createElement('div', [], {
            class: 'description'
        })
    ], {
        class: 'gs-player',
        style: {
            display: 'none',
        } 
    });

    app.search.input.setAttribute(
        'oninput',
        '(' + (function() {
            let count = 0;

            app.main.library.querySelectorAll('.sf-entry').forEach(node => {
                if (node.getAttribute('data-title').toLowerCase().includes(app.search.input.value.toLowerCase())) {
                    node.setAttribute('data-active', '1');
                    count++;
                } else {
                    node.removeAttribute('data-active');
                };
            }); 

            app.main.library.querySelectorAll('.category').forEach(node => {
                if (!node.querySelectorAll('.sf-library .sf-entry[data-active]').length) {
                    node.style.display = 'none';
                } else {
                    node.style.removeProperty('display');
                };
            });

            if (!count) {
                app.main.library.style.display = 'none';
                app.main.emptySearch.style.display = 'block';
            } else {
                app.main.library.style.removeProperty('display');
                app.main.emptySearch.style.display = 'none';
            };
        }).toString() + ')()'
    )
};


async function compileGs(app) {
    const res = await fetch('./sflix.json');
    const json = await res.json();

    const list = {
        action_adventure: [],
        animation: [],
        biography: [],
        comedy: [],
        crime: [],
        documentary: [],
        drama: [],
        family: [],
        fantasy: [],
        history: [],
        horror: [],
        musical: [],
        romance: [],
        scifi: [],
        sport: [],
        thriller: [],
    };

    for (const entry of json) {
        const elem = app.createElement('div', [], {
            class: 'sf-entry',
            style: {
                background: `url(${entry.img})`,
                'background-size': 'cover'
            },
            attrs: {
                'data-title': entry.title,
                'data-active': '1'
            },
            events: {
                click(event) {
                    function foc() {
                        if (window.location.hash !== '#sflix' || !app.main.player) {
                            return window.removeEventListener('click', foc);
                        };
                        app.main.player.querySelector('iframe').contentWindow.focus()
                    };
                    app.main.library.style.display = 'none';
                    app.main.player.style.display = 'block';
                    app.search.input.style.display = 'none';
                    app.search.title.style.display = 'block';
                    app.search.title.textContent = entry.title;

                    window.addEventListener('click', foc);

                    app.nav.fullscreen = app.createElement('button', 'fullscreen', {
                        class: 'submit', 
                        style: {
                            'font-family': 'Material Icons',
                            'font-size': '30px',
                            color: 'var(--accent)',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        },
                        events: {
                            click() {
                                app.main.player.querySelector('iframe').requestFullscreen();
                                app.main.player.querySelector('iframe').contentWindow.focus();
                            }
                        }
                    });

                    app.main.player.querySelector('iframe').src = entry.location;
                    app.main.player.querySelector('.author').textContent = entry.author || '';
                    app.main.player.querySelector('.description').textContent = entry.description || '';

                    window.scrollTo({ top: 0 });

                    app.search.back.setAttribute(
                        'onclick', 
                        '(' + (() => {

                            if (window.location.hash !== '#sflix') return this.removeAttribute('onclick');

                            event.preventDefault();
                            
                            app.main.library.style.removeProperty('display');
                            app.search.input.style.removeProperty('display');
                            app.search.title.style.display = 'none';
                            app.search.title.textContent = '';
                            app.main.player.style.display = 'none';
                            app.main.player.querySelector('iframe').src = 'about:blank';
                            delete app.nav.fullscreen;

                            this.removeAttribute('onclick');

                        }).toString() + ')()'
                    );
                   /*
                   nav(entry.location, entry.title, entry.img);
                   */
                }
            }        });

        if (entry.featured) {
            list.featured.push(elem);
        } else {
            (list[entry.category] || list.indie).push(elem);
        };
    };

    return [
        app.createElement('section', [
            app.createElement('span', 'Action/Adventure', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.action_adventure, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section action_adventure category',
            attrs: {
                'data-category': 'action_adventure'
            }
        }), 
        app.createElement('section', [
            app.createElement('span', 'Animation', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.animation, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section animation category',
            attrs: {
                'data-category': 'animation'
            }
        }),
        app.createElement('section', [
            app.createElement('span', 'Comedy', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.comedy, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section comedy category',
            attrs: {
                'data-category': 'comedy'
            }
        }),
        app.createElement('section', [
            app.createElement('span', 'Crime', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.crime, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section crime category',
            attrs: {
                'data-category': 'crime'
            }
        }),
            app.createElement('div', list.crime, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section crime category',
            attrs: {
                'data-category': 'crime'
            }
        }),
        app.createElement('section', [
            app.createElement('span', 'Documentaries', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.documentary, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section documentary category',
            attrs: {
                'data-category': 'documentary'
            }
        }),        app.createElement('section', [
            app.createElement('span', 'Drama', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.drama, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section drama category',
            attrs: {
                'data-category': 'drama'
            }
        }), 
          // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Family', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.family, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section family category',
            attrs: {
                'data-category': 'family'
            }
        }),
                    // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Fantasy', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.fantasy, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section fantasy category',
            attrs: {
                'data-category': 'fantasy'
            }
        }),
                    // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'History', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.history, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section history category',
            attrs: {
                'data-category': 'history'
            }
        }),
                    // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Horror', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.horror, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section horror category',
            attrs: {
                'data-category': 'horror'
            }
        }),
                              // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Musical', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.musical, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section musical category',
            attrs: {
                'data-category': 'musical'
            }
        }),
                                        // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Romance', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.romance, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section musical category',
            attrs: {
                'data-category': 'musical'
            }
        }),
                              // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Sci-Fi', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.scifi, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section musical category',
            attrs: {
                'data-category': 'scifi'
            }
        }),
                                        // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Sport', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.sport, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section sport category',
            attrs: {
                'data-category': 'sport'
            }
        }),
                                                  // NEW SECTION
          app.createElement('section', [
            app.createElement('span', 'Thriller', {
                style: {
                    display: 'block',
                    'margin-bottom': '30px',
                    'font-size': '18px',
                    'font-weight': '500'
                }
            }),
            app.createElement('div', list.thriller, {
                class: 'sf-library'
            })
        ], {
            class: 'data-section thriller category',
            attrs: {
                'data-category': 'thriller'
            }
        })
            
    ]
};

export { sflix };
