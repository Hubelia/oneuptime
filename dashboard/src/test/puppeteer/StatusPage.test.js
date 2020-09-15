const puppeteer = require('puppeteer');
const utils = require('./test-utils');
const init = require('./test-init');
const { Cluster } = require('puppeteer-cluster');

require('should');

// user credentials
const email = utils.generateRandomBusinessEmail();
const password = '1234567890';
const componentName = 'hackerbay';
const monitorName = 'fyipe.com';
const monitorName1 = 'test.fyipe.com';

const gotoTheFirstStatusPage = async page => {
    await page.goto(utils.DASHBOARD_URL);
    await page.waitForSelector('#statusPages > a');
    await page.click('#statusPages > a');
    const rowItem = await page.waitForSelector(
        '#statusPagesListContainer > tr',
        { visible: true }
    );
    rowItem.click();
};

describe('Status Page', () => {
    const operationTimeOut = 500000;

    let cluster;
    beforeAll(async () => {
        jest.setTimeout(360000);

        cluster = await Cluster.launch({
            concurrency: Cluster.CONCURRENCY_PAGE,
            puppeteerOptions: utils.puppeteerLaunchConfig,
            puppeteer,
            timeout: 500000,
        });

        cluster.on('error', err => {
            throw err;
        });

        return await cluster.execute(
            { email, password },
            async ({ page, data }) => {
                const user = {
                    email: data.email,
                    password: data.password,
                };

                // user
                await init.registerUser(user, page);
                await init.loginUser(user, page);

                //project + status page
                await init.addProject(page);
                await init.addStatusPageToProject('test', 'test', page);

                //component + monitor
                await init.addComponent(componentName, page);
                await init.addMonitorToComponent(null, monitorName, page);
                await page.goto(utils.DASHBOARD_URL);
                await page.waitForSelector('#components', { visible: true });
                await page.click('#components');
                await page.waitForSelector(`#more-details-${componentName}`, {
                    visible: true,
                });
                await page.click(`#more-details-${componentName}`);
                await init.addMonitorToComponent(null, monitorName1, page);
                await page.waitForSelector('.ball-beat', { hidden: true });
            }
        );
    });

    afterAll(async done => {
        await cluster.idle();
        await cluster.close();
        done();
    });

    test(
        'should indicate that no monitor is set yet for a status page',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                const elem = await page.waitForSelector('#app-loading', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
                const element = await page.$eval('#app-loading', e => {
                    return e.innerHTML;
                });
                expect(element).toContain(
                    'No monitors are added to this status page.'
                );
            });
        },
        operationTimeOut
    );

    test(
        'should show error message and not submit the form if no monitor is selected and user clicks on save.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#addMoreMonitors');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-0');
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(3000);
                const textContent = await page.$eval(
                    '#monitor-0',
                    e => e.textContent
                );
                expect(
                    textContent.includes('A monitor must be selected.')
                ).toEqual(true);
                await page.reload({ waitUntil: 'networkidle0' });
                await page.waitFor(3000);
                const monitor = await page.$$('#monitor-0');
                expect(monitor.length).toEqual(0);
            });
        },
        operationTimeOut
    );

    test(
        'should show error message and not submit the form if no chart is selected.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#addMoreMonitors');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-0');
                await init.selectByText(
                    '#monitor-0 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#monitor-0 .Checkbox');
                await page.waitForSelector('#monitor-0 .errors', {
                    visible: true,
                });
                const element = await page.$eval('#monitor-0 .errors', e => {
                    return e.innerHTML;
                });
                expect(element).toContain(
                    'You must select at least one bar chart'
                );
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(3000);
                await page.reload({ waitUntil: 'networkidle0' });
                await page.waitFor(3000);
                const monitor = await page.$$('#monitor-0');
                expect(monitor.length).toEqual(0);
            });
        },
        operationTimeOut
    );

    test(
        'should show an error message and not submit the form if the users select the same monitor twice.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#addMoreMonitors');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-0');
                await init.selectByText(
                    '#monitor-0 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-1');
                await init.selectByText(
                    '#monitor-1 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(3000);
                const textContent = await page.$eval(
                    '#monitor-1',
                    e => e.textContent
                );
                expect(
                    textContent.includes('This monitor is already selected.')
                ).toEqual(true);
                await page.reload({ waitUntil: 'networkidle0' });

                await page.waitFor(3000);

                const monitor = await page.$$('#monitor-0');
                expect(monitor.length).toEqual(0);
                const monitor1 = await page.$$('#monitor-1');
                expect(monitor1.length).toEqual(0);
            });
        },
        operationTimeOut
    );

    test(
        'should add a new monitor.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#addMoreMonitors');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-0');
                await init.selectByText(
                    '#monitor-0 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(5000);
                await page.reload({ waitUntil: 'networkidle0' });
                const elem = await page.waitForSelector('#monitor-0', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'should remove monitor.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#monitor-0');
                await page.click('#delete-monitor-0');
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(5000);
                await page.reload({ waitUntil: 'networkidle0' });
                const elem = await page.waitForSelector('#app-loading', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
                const element = await page.$eval('#app-loading', e => {
                    return e.innerHTML;
                });
                expect(element).toContain(
                    'No monitors are added to this status page.'
                );
            });
        },
        operationTimeOut
    );

    test(
        'should add more than one monitor.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#addMoreMonitors');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-0');
                await init.selectByText(
                    '#monitor-0 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-1');
                await init.selectByText(
                    '#monitor-1 .db-select-nw',
                    `${componentName} / ${monitorName1}`,
                    page
                );
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(5000);
                await page.reload({ waitUntil: 'networkidle0' });
                const firstMonitorContainer = await page.waitForSelector(
                    '#monitor-0',
                    {
                        visible: true,
                    }
                );
                expect(firstMonitorContainer).toBeTruthy();
                const secondMonitorContainer = await page.waitForSelector(
                    '#monitor-1',
                    {
                        visible: true,
                    }
                );
                expect(secondMonitorContainer).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'Status page should render monitors in the same order as in the form.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#publicStatusPageUrl');

                let link = await page.$('#publicStatusPageUrl > span > a');
                link = await link.getProperty('href');
                link = await link.jsonValue();
                await page.goto(link);
                await page.waitForSelector('#monitor0');
                const firstMonitorBeforeSwap = await page.$eval(
                    '#monitor0 .uptime-stat-name',
                    e => e.textContent
                );
                const secondMonitorBeforeSwap = await page.$eval(
                    '#monitor1 .uptime-stat-name',
                    e => e.textContent
                );
                expect(firstMonitorBeforeSwap).toEqual(monitorName);
                expect(secondMonitorBeforeSwap).toEqual(monitorName1);

                // We delete the first monitor in the status page, and we insert it again
                await gotoTheFirstStatusPage(page);
                await page.waitForSelector('#delete-monitor-0');
                await page.click('#delete-monitor-0');
                await page.click('#addMoreMonitors');
                await page.waitForSelector('#monitor-1');
                await init.selectByText(
                    '#monitor-1 .db-select-nw',
                    `${componentName} / ${monitorName}`,
                    page
                );
                await page.click('#btnAddStatusPageMonitors');
                await page.waitFor(5000);
                await page.reload({ waitUntil: 'networkidle0' });
                // We check if the monitors are added
                const firstMonitorContainer = await page.waitForSelector(
                    '#monitor-0',
                    {
                        visible: true,
                    }
                );
                expect(firstMonitorContainer).toBeTruthy();
                const secondMonitorContainer = await page.waitForSelector(
                    '#monitor-1',
                    {
                        visible: true,
                    }
                );
                expect(secondMonitorContainer).toBeTruthy();

                await page.goto(link);
                await page.waitForSelector('#monitor0');
                const firstMonitorAfterSwap = await page.$eval(
                    '#monitor0 .uptime-stat-name',
                    e => e.textContent
                );
                const secondMonitorAfterSwap = await page.$eval(
                    '#monitor1 .uptime-stat-name',
                    e => e.textContent
                );
                expect(firstMonitorAfterSwap).toEqual(secondMonitorBeforeSwap);
                expect(secondMonitorAfterSwap).toEqual(firstMonitorBeforeSwap);
            });
        },
        operationTimeOut
    );

    test(
        'should indicate that no domain is set yet for a status page.',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.$eval('#statusPages > a', elem => elem.click());
                const elem = await page.waitForSelector('#domainNotSet', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'should create a domain',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'fyipeapp.com');
                await page.click('#btnAddDomain');
                // if domain was not added sucessfully, list will be undefined
                // it will timeout
                const list = await page.waitForSelector(
                    'fieldset[name="added-domain"]',
                    { visible: true }
                );
                expect(list).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'should indicate if domain(s) is set on a status page',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await page.goto(utils.DASHBOARD_URL);
                await page.$eval('#statusPages > a', elem => elem.click());

                const elem = await page.waitForSelector('#domainSet', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'should update a domain',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                const finalValue = 'status.fyipeapp.com';

                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector(
                    'fieldset[name="added-domain"] input[type="text"]'
                );

                const input = await page.$(
                    'fieldset[name="added-domain"] input[type="text"]'
                );
                await input.click({ clickCount: 3 });
                await input.type(finalValue);

                await page.click('#btnAddDomain');
                await page.reload({ waitUntil: 'networkidle0' });

                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');

                const finalInputValue = await page.$eval(
                    'fieldset[name="added-domain"] input[type="text"]',
                    domain => domain.value
                );

                expect(finalInputValue).toEqual(finalValue);
            });
        },
        operationTimeOut
    );

    test(
        'should not verify a domain when txt record does not match token',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#btnVerifyDomain');
                await page.click('#btnVerifyDomain');

                await page.waitForSelector('#confirmVerifyDomain');
                await page.click('#confirmVerifyDomain');
                // element will be visible once the domain was not verified
                const elem = await page.waitForSelector('#verifyDomainError', {
                    visible: true,
                });
                expect(elem).toBeTruthy();
            });
        },
        operationTimeOut
    );

    test(
        'should delete a domain in a status page',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('fieldset[name="added-domain"]');
                await page.waitFor(3000);

                //Get the initial length of domains
                const initialLength = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );

                // create one more domain on the status page
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'app.fyipeapp.com');
                await page.click('#btnAddDomain');
                await page.reload({ waitUntil: 'networkidle0' });

                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('.btnDeleteDomain');
                await page.$eval('.btnDeleteDomain', elem => elem.click());
                await page.$eval('#confirmDomainDelete', elem => elem.click());

                await page.reload({ waitUntil: 'networkidle0' });
                // get the final length of domains after deleting
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('fieldset[name="added-domain"]');
                const finalLength = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );

                expect(finalLength).toEqual(initialLength);
            });
        },
        operationTimeOut
    );

    test(
        'should cancel deleting of a domain in a status page',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');

                await page.waitForSelector('fieldset[name="added-domain"]');
                await page.waitFor(3000);
                //Get the initial length of domains
                const initialLength = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );

                // create one more domain on the status page
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'server.fyipeapp.com');
                await page.click('#btnAddDomain');
                await page.reload({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');

                await page.waitForSelector('.btnDeleteDomain');
                await page.$eval('.btnDeleteDomain', elem => elem.click());
                await page.$eval('#cancelDomainDelete', elem => elem.click());

                await page.reload({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('fieldset[name="added-domain"]');
                // get the final length of domains after cancelling
                const finalLength = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );

                expect(finalLength).toBeGreaterThan(initialLength);
            });
        },
        operationTimeOut
    );

    test(
        'should create custom HTML and CSS',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'load' });

                await page.waitForSelector('#react-tabs-4');
                await page.click('#react-tabs-4');
                await page.type('#headerHTML textarea', '<div>My header'); // Ace editor completes the div tag
                await page.waitFor(3000);
                await page.click('#btnAddCustomStyles');
                await page.waitFor(3000);

                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#publicStatusPageUrl');

                let link = await page.$('#publicStatusPageUrl > span > a');
                link = await link.getProperty('href');
                link = await link.jsonValue();
                await page.goto(link);
                await page.waitForSelector('#customHeaderHTML > div');

                let spanElement = await page.$('#customHeaderHTML > div');
                spanElement = await spanElement.getProperty('innerText');
                spanElement = await spanElement.jsonValue();
                spanElement.should.be.exactly('My header');
            });
        },
        operationTimeOut
    );

    test(
        'should create custom Javascript',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                const javascript = `console.log('this is a js code');`;
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'load' });

                await page.waitForSelector('#react-tabs-4');
                await page.click('#react-tabs-4');
                await page.waitForSelector('#customJS textarea');
                await page.type(
                    '#customJS textarea',
                    `<script id='js'>${javascript}`
                );
                await page.waitFor(3000);
                await page.click('#btnAddCustomStyles');
                await page.waitFor(3000);

                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#publicStatusPageUrl');

                let link = await page.$('#publicStatusPageUrl > span > a');
                link = await link.getProperty('href');
                link = await link.jsonValue();
                await page.goto(link);
                await page.waitFor('#js');

                const code = await page.$eval(
                    '#js',
                    script => script.innerHTML
                );
                expect(code).toEqual(javascript);
            });
        },
        operationTimeOut
    );

    test(
        'should not add a domain when the field is empty',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#btnAddDomain');
                await page.click('#btnAddDomain');
                let elem = await page.$('#field-error');
                elem = await elem.getProperty('innerText');
                elem = await elem.jsonValue();
                expect(elem).toEqual('Domain is required.');
            });
        },
        operationTimeOut
    );

    test(
        'should not add an invalid domain',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'fyipeapp');
                await page.waitForSelector('#btnAddDomain');
                await page.click('#btnAddDomain');
                let elem = await page.$('#field-error');
                elem = await elem.getProperty('innerText');
                elem = await elem.jsonValue();
                expect(elem).toEqual('Domain is not valid.');
            });
        },
        operationTimeOut
    );

    test(
        'should add multiple domains',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'fyipe.fyipeapp.com');

                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_2', { visible: true });
                await page.type('#domain_2', 'api.fyipeapp.com');
                await page.waitForSelector('#btnAddDomain');
                await page.click('#btnAddDomain');
                await page.waitFor(10000);
                const domains = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );
                expect(domains).toEqual(4);
            });
        },
        operationTimeOut
    );

    test(
        'should not add an existing domain',
        async () => {
            return await cluster.execute(null, async ({ page }) => {
                await gotoTheFirstStatusPage(page);
                await page.waitForNavigation({ waitUntil: 'networkidle0' });
                await page.waitForSelector('#react-tabs-2');
                await page.click('#react-tabs-2');
                const initialDomains = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );
                await page.waitForSelector('#addMoreDomain');
                await page.click('#addMoreDomain');
                await page.waitForSelector('#domain_1', { visible: true });
                await page.type('#domain_1', 'fyipe.fyipeapp.com');
                await page.click('#addMoreDomain');
                await page.waitFor(5000);
                const domains = await page.$$eval(
                    'fieldset[name="added-domain"]',
                    domains => domains.length
                );
                expect(domains).toEqual(initialDomains);
            });
        },
        operationTimeOut
    );
});
