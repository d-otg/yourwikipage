<script lang="ts">
    const CHAR_LIMIT = 160;
    
    let description = ""; 

    $: charsLeft = CHAR_LIMIT - description.length;

    async function handleSubmit(event: { currentTarget: EventTarget & HTMLFormElement }) {

        let formData = new FormData(event.currentTarget);
        let description = formData.get("description");

        await fetch(`/api/pages?description=${description}`);
    }

    async function handleInput(event: { currentTarget: EventTarget & HTMLTextAreaElement}) {
        if (event.currentTarget.value.length >= CHAR_LIMIT) {
            description = description.slice(0, CHAR_LIMIT);
        }
    }
</script>

<section class="prompt-container">
    <div class="card">
        <h2 class="card-title prompt-title">Generate your Wiki page</h2>
        <div class="card-body">
            <form method="POST" on:submit|preventDefault={handleSubmit}>
                <div class="form-item">
                    <label for="txtDesc">Brief description about yourself:</label>
                    <textarea 
                        bind:value={description}
                        on:input={handleInput} 
                        required 
                        name="description" 
                        id="txtDesc" 
                        rows="2" 
                        maxlength={CHAR_LIMIT}
                        placeholder="I'm a software engineer building fun projects and interested in learning about occult knowledge."></textarea>
                </div>
                <div class="form-item txt-info">
                    <div>
                        <span class="character-counter">{charsLeft} character(s) left</span>
                    </div>
                    <button id="btnSubmit" type="submit">Generate your wiki page</button>
                </div>
            </form>
        </div>
    </div>
    <div class="creator-container">
        <small>made by: <a href="https://x.com/daniel_cpe" target="_blank">@daniel_cpe</a></small>
    </div>
</section>

<style>
.form-item {
    margin-bottom: 0.15rem;
}

.form-item label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: #343434;
}

#txtDesc {
    width: 100%;
    resize: none;
    font-size: 0.9rem;
    color: #343434;
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

.txt-info {
    display: flex;
    justify-content: space-between;
}

.character-counter {
    font-size: 0.8rem;
    color: #343434;
}

#btnSubmit {
    padding: 0.35rem 1rem;
    font-size: 0.9rem;
    font-weight: bold;
    color: #fff;
    background-color: #36c;
    border: 1px solid #36c;
    cursor: pointer;
    font-family: sans-serif;
    transition: background-color 250ms ease-in-out;
}

#btnSubmit:focus {
    border: 1px solid #fff;
    outline: 1px solid #36c;
}

#btnSubmit:hover {
    background-color: #4b77d6;
}

.creator-container {
    margin-top: 0.5rem;
}
</style>