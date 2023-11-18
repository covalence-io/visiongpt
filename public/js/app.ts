(function () {
    const form = document.querySelector('form');
    const textarea = document.querySelector('textarea');
    const responses = document.getElementById('responses');
    const file = document.getElementById('file') as HTMLInputElement;
    const img = document.querySelector('img') as HTMLImageElement;
    const messages = [] as IMessage[];

    function addMe(text: string) {
        addText(text, 'Me');
    }

    function addGPT(text: string) {
        addText(text, 'ChatGPT');
    }

    function addText(text: string, prefix: string) {
        const el = document.createElement('div');
        el.className = 'response';

        el.textContent = `${prefix}: ${text}`;

        let role = 'system' as IRole;

        switch (prefix) {
            case 'ChatGPT':
                role = 'assistant';
                break;
            case 'Me':
                role = 'user';
                break;
        }

        messages.push({
            role,
            content: [{
                type: 'text',
                text,
            }],
        });

        responses?.insertBefore(el, responses.firstChild);
    }

    function addImage() {
        if (!img || !FileReader || !file?.files?.[0]) {
            alert('Images not supported');
            return;
        }

        const fileReader = new FileReader();

        fileReader.readAsDataURL(file.files[0]);

        fileReader.onload = (ev) => {
            const res = ev.target?.result as string;

            img.src = res;
            img.classList.remove('hidden');

            const image = {
                role: 'user',
                content: [{
                    type: 'image_url',
                    image_url: {
                        url: res,
                    },
                }],
            } as IMessage;

            if (messages.length > 0) {
                if (messages[messages.length - 1]?.content?.[0].type === 'image_url') {
                    messages[messages.length - 1] = image;
                } else {
                    messages.push(image);
                }
            } else {
                messages.push(image);
            }
        };
    }

    file?.addEventListener('change', addImage, false);

    form?.addEventListener('submit', async (ev) => {
        ev.preventDefault();

        const prompt = textarea?.value;

        if (!prompt) {
            alert('Prompt needed to continue');
            return;
        }

        addMe(prompt);
        textarea.value = '';

        try {
            const res = await fetch('/api/v1/ai', {
                method: 'POST',
                body: JSON.stringify({
                    prompt: messages,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();

            if (res.status !== 200) {
                throw new Error(data.error);
            }

            addGPT(data?.choices?.[0]?.message?.content);
        } catch (e) {
            alert(`Error: ${(e as Error).message}`);
        }
    }, false);
})();

type IRole = 'system'|'user'|'assistant';
type IType = 'text'|'image_url';

interface IContent {
    type: IType;
    text?: string;
    image_url?: {
        url: string;
        detail?: 'low'|'high'|'auto';
    };
}

interface IMessage {
    role: IRole;
    content: IContent[];
}