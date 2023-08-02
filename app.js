const wiki = require('wikijs').default;
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

let counter = 0;

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const unwantedLinks = new Set(['/wiki/Help:', '/wiki/File:', '/wiki/Wikipedia:', '/wiki/Special:', '/wiki/Talk:', '/wiki/User:', '/wiki/Portal:', '/wiki/Template:']);

async function findFirstLinkInParagraph(articleTitle) {
    if (counter < 25) {
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


                const filename = 'wiki_research.txt';
                const contentToWrite = 'https://en.wikipedia.org' + link + '\n';

                fs.access(filename, fs.constants.F_OK, (err) => {
                    if (err) {
                        // File does not exist, so create a new file and write to it
                        fs.writeFile(filename, contentToWrite, (writeErr) => {
                            if (writeErr) {
                                console.error('Error creating and writing to file:', writeErr);
                            } else {
                                console.log('File created and content written successfully!');
                            }
                        });
                    } else {
                        // File exists, so append content to it
                        fs.appendFile(filename, contentToWrite, (appendErr) => {
                            if (appendErr) {
                                console.error('Error appending to file:', appendErr);
                            } else {
                                console.log('Content appended to the file successfully!');
                            }
                        });
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
        counter++;
    }
}

// findFirstLinkInParagraph('Mathematics');
//findFirstLinkInParagraph('Kullback–Leibler divergence');
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

readline.question('\nWhere to start? \n', startPage => {
    console.log('');
    findFirstLinkInParagraph(startPage);
    readline.close();
});

//cd Visual Studio Code projects\node js\js2