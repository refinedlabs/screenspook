/* get a ScreenSpook instance of our local ScreenSpook server */
var screenSpook=require('./screenSpook').create('http://localhost:3000');

/* open todo app */
casper.start('http://localhost:8080', function() {
    casper.viewport(1024, 768);
    this.evaluate(function() {
        window.localStorage.clear();
    });
});

casper.thenOpen('http://localhost:8080', function() {
    screenSpook.assertScreenshotAccepted("1 - Show the app title and a text box");
});

casper.then(function() {
    this.evaluate(function() {
        document.querySelector("#new-todo").value ='Prepare MunichJS talk';

        // TODO This should simulate a keyboard event using PhantomJS (see WebPage.cpp)
        App.createOnEnter({code:13});
    });

    screenSpook.assertScreenshotAccepted("2 - Entered a TODO");
});

casper.then(function() {
    this.click('.todo-check');
    screenSpook.assertScreenshotAccepted("3 - Checked the first TODO");    
});

casper.then(function() {
    this.evaluate(function() {
        document.querySelector("#new-todo").value = 'Declare independence';
        App.createOnEnter({code:13});
    });

    screenSpook.assertScreenshotAccepted("4 - Entered 2nd TODO");
});

casper.then(function() {
    this.click('.todo-clear');
    screenSpook.assertScreenshotAccepted("5 - Cleared finished TODOs");    
}); 

casper.run(function() {
    this.test.done();
});
