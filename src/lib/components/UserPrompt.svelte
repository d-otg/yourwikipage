<script lang="ts">
    import type { PageResults } from "$lib/types";
    import Results from "./Results.svelte";

    const CHAR_LIMIT = 160;
    
    let titles: string[] = $state([]);
    let input: string = $state("");
    let errorMessage: string = $state("");
    let isInvalidInput: boolean = $state(false);

    let submitBtn: HTMLButtonElement;

    let charCount = $derived(input.length);

    async function handleSubmit(e: Event & { currentTarget: EventTarget & HTMLFormElement }) {
        e.preventDefault();
        
        let formData = new FormData(e.currentTarget);
        let description = formData.get("description");

        if (!description?.toString().trim().length || description?.toString().trim().length <= 0) {
            isInvalidInput = true;
            return;
        }

        errorMessage = "";
        
        try {
            submitBtn.classList.add("button-loading");
            submitBtn.disabled = true;
            
            const response = await fetch(`/api/pages?description=${description}`);

            if (!response.ok) {
                let error: Error = await response.json();
                
                input = "";

                submitBtn.classList.remove("button-loading");
                submitBtn.disabled = false;

                if (response.status === 429) {
                    errorMessage = "You hit the rate limit. Please try again in a few minutes.";
                    return;
                }
                else if (response.status === 500) {
                    errorMessage = "Something went wrong, our team of incredibly talented engineers are already looking into it."
                    return;
                }
                else {
                    errorMessage = error.message;
                    return;
                }
            }

            let results = await response.json() as PageResults;

            titles = results.titles;

            submitBtn.classList.remove("button-loading");
            submitBtn.disabled = false;
        } catch {
            errorMessage = "An unexpected error ocurred, please try again later.";
        }
    }

    async function handleInput(e: { currentTarget: EventTarget & HTMLTextAreaElement}) {
        isInvalidInput = false;
        errorMessage = "";

        if (e.currentTarget.value.length >= CHAR_LIMIT) {
            input = input.slice(0, CHAR_LIMIT);
        }
    }

    function resetResults() {
        titles = [];
        input = "";
    }
</script>

<section class="prompt-container">
    <div class="card">
        <h2 class="card-title">Discover your Wikipedia table of contents</h2>
        <div style="text-align: center; margin-bottom: 1rem;">
            <span class="help-text">Enter a brief description about yourself to discover what your Wikipedia table of contents would look like</span>
        </div>
        <div class="card-body">
            <form method="POST" onsubmit={handleSubmit}>
                <div class="form-item">
                    <div class="char-counter-container">
                        <span class="char-counter">{charCount}/{CHAR_LIMIT}</span>
                    </div>
                    <textarea 
                        class:invalid={isInvalidInput}
                        bind:value={input}
                        oninput={handleInput} 
                        required 
                        name="description" 
                        id="txtDesc" 
                        rows="3" 
                        maxlength={CHAR_LIMIT}
                        placeholder="I'm a software engineer by day, vigilante by night"></textarea>
                    {#if isInvalidInput}
                        <div><small class="validation-msg invalid">This field is required</small></div>
                    {/if}
                    {#if errorMessage}
                    <div><small class="validation-msg invalid">{errorMessage}</small></div>
                    {/if}
                </div>
                <div class="form-item">
                    <button type="submit" class="btn primary submit" bind:this={submitBtn}>
                        <span class="button-text">Generate table of contents</span>
                    </button>
                </div>
            </form>
        </div>
    </div>
</section>

{#if titles.length > 0}
    <Results {titles} {resetResults} />
{/if}

<style>
    form {
        width: 100%;
        margin: 0 auto;
    }

    .form-item {
        margin-bottom: 0.5rem;
    }

    .char-counter-container {
        text-align: right;
    }

    .char-counter {
        font-size: 0.9rem;
        color: #636363;
    }

    #txtDesc {
        width: 100%;
        resize: none;
        font-size: 1rem;
        color: #202122;
        padding: 0.25rem 0.5rem;
        background-color: #fff;
        border: 1px solid #a2a9b1;
        font-family: sans-serif;
        line-height: 1.75rem;
        transition-property: border-color, box-shadow;
        transition-duration: 250ms;
    }

    #txtDesc:focus {
        outline: 1px solid transparent !important;
        border: 1px solid #36c;
        box-shadow: inset 0 0 0 1px #36c;
    }

    #txtDesc.invalid:focus {
        border: 1px solid #e74c3c;
        box-shadow: inset 0 0 0 1px #e74c3c;
    }

    #txtDesc.invalid {
        border: 1px solid #e74c3c;
    }

    .btn.submit {
        width: 100%;
        position: relative;
    }

    .validation-msg.invalid {
        color: #e74c3c;
    }

    @media only screen and (min-width: 920px) {
        form {
            width: 80%;
        }
    }

    @media only screen and (min-width: 1420px) {
        form {
            width: 70%;
        }
    }

    @media only screen and (min-width: 1620px) {
        form {
            width: 50%;
        }
    }
</style>