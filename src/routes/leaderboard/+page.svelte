<script lang="ts">
    import { onMount, onDestroy, afterUpdate } from "svelte";
    import { enhance } from "$app/forms";
    import type { User } from "../../types/User.js";
    import {gsap} from "gsap"

    export let data;
    let users: Array<User> = data.data as User[];
    let eventSource: EventSource;
    let leaderboardContainer: HTMLElement;
    let cardElements: HTMLElement[] = [];
    let previousPositions = new Map();

    // Game mode variables
    let isGameMode = false;
    let currentPage = 0;
    let cardsPerPage = 7; // Number of cards to show at once in game mode
    let gameInterval: ReturnType<typeof setInterval> | undefined;
    let intervalDuration = 8000; // 5 seconds
    let visibleUsers: User[] = [];
    let isTransitioning = false;

    // Store initial positions of cards
    function storePositions() {
        cardElements.forEach((card, index) => {
            if (card && users[index]) {
                const rect = card.getBoundingClientRect();
                previousPositions.set(users[index]._id, {
                    top: rect.top,
                    left: rect.left
                });
            }
        });
    }

    // Animate position changes (for preview mode)
    function animatePositionChanges() {
        if (isGameMode) return; // Don't animate positions in game mode
        
        cardElements.forEach((card, index) => {
            if (card && users[index]) {
                const userId = users[index]._id;
                const previousPos = previousPositions.get(userId);
                
                if (previousPos) {
                    const currentRect = card.getBoundingClientRect();
                    const deltaY = previousPos.top - currentRect.top;
                    const deltaX = previousPos.left - currentRect.left;
                    
                    if (Math.abs(deltaY) > 1 || Math.abs(deltaX) > 1) {
                        // Set initial position to where it was before
                        gsap.set(card, {
                            x: deltaX,
                            y: deltaY,
                            scale: 1.05,
                            zIndex: 10
                        });
                        
                        // Animate to new position
                        gsap.to(card, {
                            x: 0,
                            y: 0,
                            scale: 1,
                            zIndex: 1,
                            duration: 0.6,
                            ease: "power2.out",
                            onComplete: () => {
                                gsap.set(card, { zIndex: 'auto' });
                            }
                        });
                    }
                }
            }
        });
        
        // Update stored positions
        setTimeout(() => {
            storePositions();
        }, 50);
    }

    // Initial animation for new cards
    function animateNewCard(card: HTMLElement, index: number) {
        gsap.fromTo(card, 
            {
                opacity: 0,
                x: -50,
                scale: 0.8
            },
            {
                opacity: 1,
                x: 0,
                scale: 1,
                duration: 0.5,
                ease: "back.out(1.7)",
                delay: index * 0.1
            }
        );
    }

    // Game mode functions
    function updateVisibleUsers() {
        if (!isGameMode) {
            visibleUsers = users;
            return;
        }

        const totalPages = Math.ceil(users.length / cardsPerPage);
        if (totalPages === 0) {
            visibleUsers = [];
            return;
        }

        // Calculate start and end indices
        const startIndex = currentPage * cardsPerPage;
        const endIndex = Math.min(startIndex + cardsPerPage, users.length);
        
        visibleUsers = users.slice(startIndex, endIndex);
    }

    function nextPage() {
        if (!isGameMode || isTransitioning || users.length === 0) return;
        
        const totalPages = Math.ceil(users.length / cardsPerPage);
        if (totalPages <= 1) return;

        isTransitioning = true;
        
        // Get all currently visible card elements from the DOM
        const currentVisibleCards = Array.from(document.querySelectorAll('.leaderboard-card')) as HTMLElement[];
        
        // Fade out current cards
        currentVisibleCards.forEach((card, index) => {
            if (card) {
                gsap.to(card, {
                    opacity: 0,
                    y: 0,
                    duration: 0.4,
                    ease: "power2.in",
                    delay: index * 0.1
                });
            }
        });

        setTimeout(() => {
            // Move to next page and update visible users ONLY after fade out completes
            currentPage = (currentPage + 1) % totalPages;
            updateVisibleUsers();
            
            // Force a small delay to ensure DOM updates
            setTimeout(() => {
                // Get the new visible cards from DOM
                const newVisibleCards = Array.from(document.querySelectorAll('.leaderboard-card')) as HTMLElement[];
                
                if (newVisibleCards.length > 0) {
                    // Set initial state for new cards (invisible)
                    newVisibleCards.forEach((card) => {
                        if (card) {
                            gsap.set(card, { opacity: 0, y: 0 });
                        }
                    });
                    
                    // Fade in new cards
                    newVisibleCards.forEach((card, index) => {
                        if (card) {
                            gsap.to(card, {
                                opacity: 1,
                                y: 0,
                                duration: 1.3,
                                ease: "power2.out",
                                delay: index * 0.2,
                                onComplete: index === newVisibleCards.length - 1 ? () => {
                                    isTransitioning = false;
                                } : undefined
                            });
                        }
                    });
                } else {
                    // Fallback if no cards found
                    isTransitioning = false;
                }
            }, 50);
        }, 600); // Wait for fade out to complete (0.4s duration + delays)
    }

    function startGameMode() {
        currentPage = 0;
        updateVisibleUsers();
        
        // Clear any existing interval
        if (gameInterval) {
            clearInterval(gameInterval);
        }
        
        // Start the cycling interval
        gameInterval = setInterval(nextPage, intervalDuration);
    }

    function stopGameMode() {
        if (gameInterval) {
            clearInterval(gameInterval);
            gameInterval = undefined;
        }
        updateVisibleUsers();
    }

    function toggleMode() {
        isGameMode = !isGameMode;
        
        if (isGameMode) {
            startGameMode();
        } else {
            stopGameMode();
        }
    }

    onMount(() => {
        eventSource = new EventSource("/leaderboard");

        eventSource.addEventListener("update", (event) => {
            // Store current positions before update (only in preview mode)
            if (!isGameMode) {
                storePositions();
            }
            
            const newUser = JSON.parse(event.data);
            const existingUserIndex = users.findIndex((u: User) => u._id === newUser._id);
            
            if (existingUserIndex !== -1) {
                // Update existing user
                users[existingUserIndex] = newUser;
            } else {
                // Add new user
                users.push(newUser);
            }
            
            users.sort((a, b) => b.points - a.points);
            updateVisibleUsers();
            
            // Trigger animation after DOM update (only in preview mode)
            if (!isGameMode) {
                setTimeout(() => {
                    animatePositionChanges();
                }, 10);
            }
        });

        eventSource.addEventListener("delete", (event) => {
            if (!isGameMode) {
                storePositions();
            }
            
            const deletedUser = JSON.parse(event.data);
            
            if (!isGameMode) {
                const cardToRemove = cardElements.find((card, index) => 
                    users[index] && users[index]._id === deletedUser._id
                );
                
                if (cardToRemove) {
                    gsap.to(cardToRemove, {
                        opacity: 0,
                        x: 50,
                        scale: 0.8,
                        duration: 0.3,
                        ease: "power2.in",
                        onComplete: () => {
                            users = users.filter((u: User) => u._id !== deletedUser._id);
                            updateVisibleUsers();
                            setTimeout(() => {
                                animatePositionChanges();
                            }, 1000);
                        }
                    });
                } else {
                    users = users.filter((u: User) => u._id !== deletedUser._id);
                    updateVisibleUsers();
                }
            } else {
                users = users.filter((u: User) => u._id !== deletedUser._id);
                updateVisibleUsers();
            }
        });

        eventSource.onerror = () => {
            console.error("EventSource error, closing connection.");
            eventSource.close();
        };

        // Initial setup
        updateVisibleUsers();

        // Initial animation for existing cards
        setTimeout(() => {
            cardElements.forEach((card, index) => {
                if (card) {
                    animateNewCard(card, index);
                }
            });
            if (!isGameMode) {
                storePositions();
            }
        }, 100);
    });

    afterUpdate(() => {
        // Store positions after each update for future animations (only in preview mode)
        if (!isGameMode) {
            setTimeout(() => {
                storePositions();
            }, 50);
        }
    });

    onDestroy(() => {
        if (eventSource) {
            eventSource.close();
        }
        if (gameInterval) {
            clearInterval(gameInterval);
        }
    });
</script>

<!-- Main background container -->
<div class="relative flex justify-center items-center w-full h-full min-h-screen"
    style="background-image: url('https://ik.imagekit.io/ecellkiit/E-Cell%20Website/image%206.webp?updatedAt=1755186624210');
        background-size: contain;
        background-position: center;
        background-repeat: no-repeat;"
>
    <!-- Overlay background with z-20 -->
    <div class="w-[90vw] bg-gradient-to-br from-green-600/30 to-black backdrop-blur-md z-20 h-[90vh] flex flex-col justify-center items-center rounded-3xl">
        
        <!-- Header with toggle -->
        <div class="flex justify-between items-center w-full px-8 py-4">
            <div class="flex-1"></div>
            <p class="text-white text-3xl flex-1 text-center">Leaderboard</p>
            <div class="flex-1 flex justify-end">
                <!-- Mode Toggle -->
                <div class="flex items-center gap-3">
                    <span class="text-white text-sm {isGameMode ? 'opacity-50' : 'opacity-100'}">Game</span>
                    <button
                        on:click={toggleMode}
                        class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 {isGameMode ? 'bg-green-600' : 'bg-gray-600'}"
                    >
                        <span class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform {isGameMode ? 'translate-x-6' : 'translate-x-1'}"></span>
                    </button>
                    <span class="text-white text-sm {isGameMode ? 'opacity-100' : 'opacity-50'}">Preview</span>
                </div>
            </div>
        </div>

        <div class="z-20 p flex flex-col gap-2 w-full h-full" bind:this={leaderboardContainer}>
            <form action="?/delete" method="POST" use:enhance class="h-full">       
                <div class="flex flex-col gap-2 justify-start items-center h-full">
                    {#if visibleUsers.length !== 0}
                        
                        <!-- Game mode indicator -->
                        {#if isGameMode}
                            <div class="text-white text-sm opacity-70 mb-2">
                                Page {currentPage + 1} of {Math.ceil(users.length / cardsPerPage)} 
                                • {visibleUsers.length} of {users.length} users
                            </div>
                        {/if}
                        
                        <!-- Scrollable container for leaderboard cards (preview mode) or fixed container (game mode) -->
                        <div class="{isGameMode ? 'game-mode-container' : 'scrollable-leaderboard'} w-full {isGameMode ? 'overflow-hidden h-auto' : 'overflow-y-auto h-[75vh]'} px-2 py-4 flex flex-col gap-8">
                            {#each visibleUsers as user, index (user._id)}
                                <div 
                                    bind:this={cardElements[index]}
                                    class={`leaderboard-card w-full h-12 rounded-xl py-14 px-8 overflow-x-hidden border-yellow-400 flex flex-row justify-between relative flex-shrink-0 ${(users.findIndex(u => u._id === user._id)) % 2 == 0 ? "bg-[#435e36]" : "bg-[#6d9755]"}`}
                                    style="will-change: transform, opacity;"
                                >
                                    <div class="ml-3 text-white flex items-center text-3xl">
                                        <span class="rank-number font-semibold">#{users.findIndex(u => u._id === user._id) + 1}</span>
                                        <span class="user-name ml-3">{user.name}</span>
                                        {#if users.findIndex(u => u._id === user._id) === 0}
                                            <p class="mb-2 ml-1">👑</p>
                                        {/if}
                                    </div>
                                    <div class="flex flex-row align-middle gap-4">
                                        <input type="hidden" name="id" id="id" value="{user._id}">
                                        <div class="bg-none rounded-xl text-white w-16 text-center h-full">
                                            <p class="p-2 -translate-y-6 font-bold text-3xl">{user.points}</p>
                                        </div>
                                    </div>
                                </div>
                            {/each}
                        </div>
                        
                    {:else}
                        <div class="text-3xl flex justify-center items-center h-full">
                            <p class="text-white opacity-70">No entries in leaderboard</p>
                        </div>
                    {/if}
                </div>
            </form>
        </div>
    </div>
</div>

<style>
    .scrollable-leaderboard {
        overflow-x: hidden;
        scrollbar-width: 0px;
        scroll-behavior: smooth;
    }

    .game-mode-container {
        min-height: 400px;
        overflow-x: hidden;
    }
    
    .leaderboard-card {
        transition: box-shadow 0.3s ease;
        overflow-x: hidden;
    }
    
    .leaderboard-card:hover {
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .rank-number {
        min-width: 25px;
        display: inline-block;
    }

    /* Hide scrollbar for preview mode */
    .scrollable-leaderboard {
        scrollbar-width: none; /* Firefox */
        -ms-overflow-style: none; /* Internet Explorer 10+ */
    }

    .scrollable-leaderboard::-webkit-scrollbar {
        display: none; /* Chrome, Safari, Opera */
    }

    /* Add subtle fade effect at top and bottom for preview mode */
    .scrollable-leaderboard::before,
    .scrollable-leaderboard::after {
        content: '';
        position: sticky;
        display: block;
        height: 20px;
        margin: 0 -8px;
        flex-shrink: 0;
        pointer-events: none;
        z-index: 10;
    }

    .scrollable-leaderboard::before {
        top: 0;
        background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), transparent);
        margin-bottom: -20px;
    }

    .scrollable-leaderboard::after {
        bottom: 0;
        background: linear-gradient(to top, rgba(0, 0, 0, 0.2), transparent);
        margin-top: -20px;
    }
</style>