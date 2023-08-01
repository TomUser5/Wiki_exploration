const wiki = require('wikijs').default;
const cheerio = require('cheerio');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const unwantedLinks = new Set(['/wiki/Help:', '/wiki/File:', '/wiki/Wikipedia:', '/wiki/Special:', '/wiki/Talk:', '/wiki/User:', '/wiki/Portal:', '/wiki/Template:']);

async function findFirstLinkInParagraph(articleTitle) {
    try {
        const page = await wiki().page(articleTitle);
        const html = await page.html();
        const $ = cheerio.load(html);
        
        let link = null;
        let boldText = null;

        $('p b').each((index, element) => {
            const paragraphContainingBoldText = $(element).parent('p');
            const linksInParagraph = paragraphContainingBoldText.find('a[href^="/wiki/"]');
            
            linksInParagraph.each((i, linkElement) => {
                const linkHref = $(linkElement).attr('href');
                if (!unwantedLinks.has(linkHref) && !linkHref.startsWith('/wiki/Help:IPA/')) {
                    link = linkHref;
                    boldText = $(element).text();
                    return false;
                }
            });

            return !link;
        });

        if (!link) {
            console.log('No suitable link found in the same paragraph as the bold text.');
            return;
        }

        const linkTitle = decodeURIComponent(link.replace('/wiki/', ''));
        console.log(`Current page: ${boldText}`);
        //console.log(`Next page: ${linkTitle}`);

        // Repeat the process with the new link after a delay of 1 second (adjust as needed)
        await delay(1000);
        findFirstLinkInParagraph(linkTitle);
    } catch (error) {
        console.error('Error:', error);
    }
}

// findFirstLinkInParagraph('Mathematics');
findFirstLinkInParagraph('Kullback–Leibler divergence');