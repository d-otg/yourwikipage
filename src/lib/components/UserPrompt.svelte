<script lang="ts">
    import type { PageResults } from "$lib/types";
    import * as htmlToImage from "html-to-image";

    const CHAR_LIMIT = 160;
    
    let descriptionInput = "";
    let isInvalidDescription = false;

    let pageTitles: string[] = [];
    let errorMsg = "";

    let resultsModal: HTMLElement;
    let resultsContent: HTMLElement;
    let submitBtn: HTMLButtonElement;

    $: charCount = descriptionInput.length;

    async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {

        let formData = new FormData(event.currentTarget);
        let description = formData.get("description");

        if (!description?.toString().trim().length || description?.toString().trim().length <= 0) {
            isInvalidDescription = true;
            return;
        }

        errorMsg = "";
        
        try {
            submitBtn.classList.add("button-loading");
            submitBtn.disabled = true;
            const response = await fetch(`/api/pages?description=${description}`);

            if (!response.ok) {
                let error: Error = await response.json();
                
                descriptionInput = "";

                submitBtn.classList.remove("button-loading");
                submitBtn.disabled = false;

                if (response.status === 429) {
                    errorMsg = "You hit the rate limit. Please try again in a few minutes.";
                    return;
                }
                else if (response.status === 500) {
                    errorMsg = "Something went wrong, our team of incredibly talented engineers are already looking into it."
                    return;
                }
                else {
                    errorMsg = error.message;
                    return;
                }
            }

            let results: PageResults = await response.json();

            pageTitles = results.titles;

            submitBtn.classList.remove("button-loading");
            submitBtn.disabled = false;

            resultsModal.style.display = "block";
        } catch {
            errorMsg = "An unexpected error ocurred, please try again later.";
        }
    }

    async function handleInput(event: { currentTarget: EventTarget & HTMLTextAreaElement}) {
        isInvalidDescription = false;
        errorMsg = "";

        if (event.currentTarget.value.length >= CHAR_LIMIT) {
            descriptionInput = descriptionInput.slice(0, CHAR_LIMIT);
        }
    }

    function saveResultsImage() {
        htmlToImage.toJpeg(resultsContent, { quality: 0.95, style: { background: "white" } })
            .then(function (dataUrl) {
                let link = document.createElement("a");
                link.download = "yourwikipage.jpeg";
                link.href = dataUrl;
                link.click();
                link.remove();
            });
    }

    function closeResults() {
        descriptionInput = "";
        resultsModal.style.display = "none";
    }
</script>

<section class="prompt-container">
    <div class="card">
        <h2 class="card-title">Discover your Wikipedia table of contents</h2>
        <div style="text-align: center; margin-bottom: 1rem;">
            <span class="help-text">Enter a brief description about yourself to discover what your Wikipedia table of contents would look like</span>
        </div>
        <div class="card-body">
            <form method="POST" on:submit|preventDefault={handleSubmit}>
                <div class="form-item">
                    <div class="char-counter-container">
                        <span class="char-counter">{charCount}/{CHAR_LIMIT}</span>
                    </div>
                    <textarea 
                        class:invalid={isInvalidDescription }
                        bind:value={descriptionInput}
                        on:input={handleInput} 
                        required 
                        name="description" 
                        id="txtDesc" 
                        rows="3" 
                        maxlength={CHAR_LIMIT}
                        placeholder="I'm a software engineer building fun projects and interested in learning about occult knowledge."></textarea>
                    {#if isInvalidDescription}
                        <div><small class="validation-msg invalid">This field is required</small></div>
                    {/if}
                    {#if errorMsg}
                    <div><small class="validation-msg invalid">{errorMsg}</small></div>
                    {/if}
                </div>
                <div class="form-item">
                    <button type="submit" class="btn primary submit" bind:this={submitBtn}><span class="button-text">Generate table of contents</span></button>
                </div>
            </form>
        </div>
    </div>
</section>
<div class="modal" bind:this={resultsModal}>
    <div class="modal-content">
        <div class="resultsImageWrapper" bind:this={resultsContent}>
            <div class="modal-header">
                <h2>Here's your Wikipedia table of contents</h2>
            </div>
            <div class="modal-body">
                <div class="contents-dropdown">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M9 17H20M9 12H20M9 7H20M4 16.5H5V17.5H4V16.5ZM4 11.5H5V12.5H4V11.5ZM4 6.5V7.5H5V6.5H4Z" stroke="#202122" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g></svg>
                    <span>Contents</span>
                    <svg viewBox="0 0 15.00 15.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#202122" stroke-width="0.00015000000000000001" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.09"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="#202122"></path> </g></svg>
                </div>
                <ol>
                    {#each pageTitles as title}
                        <li><svg viewBox="0 0 15.00 15.00" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#202122" stroke-width="0.00015000000000000001" transform="rotate(0)"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" stroke="#CCCCCC" stroke-width="0.09"></g><g id="SVGRepo_iconCarrier"> <path fill-rule="evenodd" clip-rule="evenodd" d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="#202122"></path> </g></svg><span class="title">{title}</span></li>
                    {/each}
                </ol>
            </div>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn primary" on:click={saveResultsImage}>Download image</button>
            <button type="button" class="btn secondary" on:click={closeResults}>Close</button>
        </div>
    </div>
</div>

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

.modal {
    display: none;
    position: fixed;
    z-index: 1;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    overflow: auto;
    background-color: rgb(0, 0, 0);
    background-color: rgba(0, 0, 0, 0.5)
}

.modal-content {
  background-color: #fff;
  margin: 2.5rem auto;
  padding: 0.5rem 0.3rem;
  border: 1px solid #888;
  width: 90%;
  min-width: 300px;
  position: relative;
  box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2),0 6px 20px 0 rgba(0,0,0,0.19);
  animation-name: animatetop;
  animation-duration: 0.4s
}

.resultsImageWrapper {
    padding: 0.5rem;
}

.modal-header {
    margin-bottom: 2rem;
}

.modal-body {
    padding: 0.5rem;
}

.modal-body > div {
    margin-bottom: 1rem;
}

.modal-body > div:last-child {
    margin-bottom: 0;
}

.modal-footer {
    text-align: right;
    padding: 0.5rem;
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
}

.contents-dropdown {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    background-color: #f8f9fa;
    border: 1px solid #dadde3;
    padding: 0.4rem;
    width: min-content;
}

.contents-dropdown span {
    font-weight: bold;
    font-size: 1rem;
    margin-right: 2.25rem;
}

ol {
    list-style: none;
}

li {
    border-bottom: 1px solid #dadde3;
    padding: 0.8rem 0;
    margin-bottom: 0.7rem;
    display: flex;
    align-items: center;
    gap: 0.15rem;
}

svg {
    height: 1.5rem;
}

.title {
    font-family: Georgia, 'Times New Roman', Times, serif;
    font-size: 1.25rem;
}

@keyframes animatetop {
  from {top: -300px; opacity: 0}
  to {top: 0; opacity: 1}
}

@media only screen and (min-width: 520px) {
    

    .contents-dropdown span {
        font-weight: bold;
        font-size: 1.2rem;
        margin-right: 2.5rem;
    }

    .title {
        font-size: 1.5rem;
    }

    svg {
        height: 2rem;
    }
}

@media only screen and (min-width: 590px) {
    .modal-content {
        width: 540px;
    }
}

@media only screen and (min-width: 920px) {
    form {
        width: 80%;
    }

    .modal-content {
        width: 600px;
    }
}

@media only screen and (min-width: 1420px) {
    form {
        width: 70%;
    }

    .modal-content {
        width: 640px;
    }
}

@media only screen and (min-width: 1620px) {
    form {
        width: 50%;
    }
}
</style>