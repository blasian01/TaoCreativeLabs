export interface PublicProduct { name: string; description: string; href?: string; icon: string; availability?: string; }

export const publicProducts: PublicProduct[] = [
    {
        "name": "ReelChef",
        "description": "Turn supported public cooking-video links into recipes you can review. Check ingredients, quantities and steps against the original before cooking.",
        "href": "https://www.reelchef.app/",
        "icon": "/project-icons/reelchef.jpg"
    },
    {
        "name": "Aura",
        "description": "Explore AI-generated clothing previews for styling ideas. Previews do not guarantee sizing or fit.",
        "href": "https://www.wearaura.app/",
        "icon": "/project-icons/aura.jpg"
    },
    {
        "name": "Nōtare",
        "description": "Record meetings, review transcripts and check summaries. Processing depends on the selected mode, device and model readiness.",
        "href": "https://www.notarenotes.com/",
        "icon": "/project-icons/notare.png"
    },
    {
        "name": "Glyph by Fortaify",
        "description": "Glyph is an AI workspace from Fortaify with local model workflows and optional connected services. Review current downloads and setup information.",
        "href": "https://www.fortaify.com/",
        "icon": "/project-icons/fortaify.png"
    }
];
