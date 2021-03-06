var inject = function () {
    document.head.appendChild((function () {

            var fn = function bootstrap(window) {

                var angular = window.angular;

                // Helper to determine if the root 'ng' module has been loaded
                // window.angular may be available if the app is bootstrapped asynchronously, but 'ng' might
                // finish loading later.
                var ngLoaded = function () {
                    if (!window.angular) {
                        return false;
                    }
                    try {
                        window.angular.module('ng');
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                };

                if (!ngLoaded()) {
                    (function () {
                        var areWeThereYet = function (ev) {
                            if (ev.srcElement.tagName === 'SCRIPT') {
                                var oldOnload = ev.srcElement.onload;
                                ev.srcElement.onload = function () {
                                    if (ngLoaded()) {

                                        document.removeEventListener('DOMNodeInserted', areWeThereYet);
                                        bootstrap(window);
                                    }
                                    if (oldOnload) {
                                        oldOnload.apply(this, arguments);
                                    }
                                };
                            }
                        };
                        document.addEventListener('DOMNodeInserted', areWeThereYet);
                    }());
                    return;
                }

                if (window.__ngDebug) {
                    return;
                }

                var Cosext = {
                    cb: 'http://' + window.location.host + '/#/cb/editor',
                    elements: [
                        {
                            name: 'prob',
                            selector: '#problem-body-content',
                            type: '题干',
                            comment: function (mathCache, input, slc) {
                                var problem = mathCache.current_problem;
                                return "题目id: " + problem._id + '\n'
                                    + '题干: ' + problem.body + '\n'
                                    + '##问题描述: ' + input;
                            }
                        },
                        {
                            name: 'choice',
                            selector: '.choice',
                            type: '选项',
                            comment: function (mathCache, input, slc) {
                                var problem = mathCache.current_problem;
                                var choice = slc.scope().choice;
                                return "题目id: " + problem._id + '\n'
                                    + '题干: ' + problem.body + '\n'
                                    + '选项: ' + choice.body + '\n'
                                    + '##问题描述: ' + input;
                            }
                        },
                        {
                            name: 'video',
                            selector: 'gh-hyper-video',
                            type: '视频',
                            comment: function (mathCache, input, slc) {
                                return "##视频问题: " + input;
                            }
                        },
                        {
                            name: 'expl',
                            selector: '#tool-nav',
                            type: '解析',
                            comment: function (mathCache, input, slc) {
                                var problem = mathCache.current_problem;
                                return "题目id: " + problem._id + '\n'
                                    + '题干: ' + problem.body + '\n'
                                    + '解析: ' + problem.expl + '\n'
                                    + '##问题描述: ' + input;
                            }
                        }, {
                            name: 'answer',
                            selector: '.judge-answer',
                            type: '答案',
                            comment: function (mathCache, input, slc) {
                                var problem = mathCache.current_problem;
                                return "题目id: " + problem._id + '\n'
                                    + '题干: ' + problem.body + '\n'
                                    + '##答案问题: ' + input;
                            }
                        }],

                    format: function (mathCache, e, input, slc) {
                        var topic = mathCache.current_topic;
                        var task = mathCache.current_task;
                        var activity = mathCache.current_activity;
                        return e.type + '问题: \n'
                            + '知识点: ' + topic.name + ' 任务: ' + task.type + ' 活动/视频名称: ' + activity.name + '\n'
                            + e.comment(mathCache, input, slc) + '\n'
                            + '##[修改链接，请先以课程编辑身份登录](' + this.link(mathCache) + ')\n';
                    },

                    link: function (mathCache) {
                        return Cosext.cb + '/chapter/' + mathCache.current_chapter._id
                            + '/contents/topic/' + mathCache.current_topic._id
                            + '/task/' + mathCache.current_task.type + '/' + mathCache.current_task._id
                            + '/activity/' + mathCache.current_activity._id + (mathCache.current_problem ?
                                ('/tag/problem/' + mathCache.current_problem.type + '/' +
                                mathCache.current_problem._id ) : '');

                    },

                    add: function () {
                        $.each(this.elements, function (index, e) {
                            var slc = 'cosext-slc-' + e.name;
                            var clas = 'cosext-class-' + e.name;
                            var slctr = $(e.selector).not('.' + slc);
                            var text = e.type + '有问题?';
                            slctr.addClass(slc);
                            slctr.each(function (index, s) {
                                $(s).before('<div class="' + clas
                                + '" style="color: #ff0000;"><input id="' + clas + 'input' + index
                                + '" type="text" style="color: #ff0000;" placeholder="' + text + '"/><button id="'
                                + clas + 'button' + index + '">提交</button></div>');
                                $('#' + clas + 'button' + index).click(function () {
                                    var output = Cosext.format(
                                        angular.element(document.body).injector().get('MathCache'),
                                        e, $('#' + clas + 'input' + index).val(), slctr);
                                    $.ajax({
                                        method: "POST",
                                        url: "https://trello.com/1/lists/5530b78881c964ef30f5cc2d/cards?key=c3ffcadf2354345a9bb1a63f72e019e1&token=3d980f8dfc435239f58257da2f9bce19c9b68185fb2f6320141721957bfac44a",
                                        data: {
                                            name: e.type + ' - ' + window.location.host,
                                            "due": null, desc: output
                                        }
                                    })
                                        .done(function (msg) {
                                            $('#' + clas + 'input' + index).val('');
                                            alert('问题提交成功');
                                        });
                                })
                            })
                        });
                        // fix bug: 不断做题，选项填空会不断增多
                        $('.choice').last().nextAll('.cosext-class-choice').remove();
                    },


                    remove: function () {
                        $.each(this.elements, function (index, e) {
                            var slc = 'cosext-slc-' + e.name;
                            var clas = 'cosext-class-' + e.name;
                            $('.' + clas).remove();
                            $('.' + slc).removeClass(slc);
                        });
                    }
                };

                setInterval(function () {
                    if (document.body.getAttribute('status') == 'true') {
                        Cosext.add();
                        console.log('add')
                    } else {
                        Cosext.remove();
                        console.log('remove')
                    }
                }, 1000);

//            console.log(window.angular);
//            console.log($("#mathcontent"));
            };

            var script = window.document.createElement('script');
            script.innerHTML = '(' + fn.toString() + '(window))';

            return script;
        }())
    );
};

chrome.runtime.sendMessage({type: 'status'});

document.addEventListener('DOMContentLoaded', inject);