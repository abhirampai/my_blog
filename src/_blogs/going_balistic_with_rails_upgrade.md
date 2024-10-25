
> medium-to-markdown@0.0.3 convert
> node index.js https://medium.com/@abhirampai/going-ballistic-with-rails-upgrade-75bce23af84e

Going ballistic with Rails upgrade
==================================

[![Abhiram R Pai](https://miro.medium.com/v2/resize:fill:88:88/1*noNoraQlXqVek4YuiU50ww.jpeg)

](https://medium.com/?source=post_page-----75bce23af84e--------------------------------)

[Abhiram R Pai](https://medium.com/?source=post_page-----75bce23af84e--------------------------------)

·

[Follow](https://medium.com/m/signin?actionUrl=https%3A%2F%2Fmedium.com%2F_%2Fsubscribe%2Fuser%2Fa8ddc8e58b9c&operation=register&redirect=https%3A%2F%2Fabhirampai.medium.com%2Fgoing-ballistic-with-rails-upgrade-75bce23af84e&user=Abhiram+R+Pai&userId=a8ddc8e58b9c&source=post_page-a8ddc8e58b9c----75bce23af84e---------------------post_header-----------)

2 min read·May 24, 2024

\--

Listen

Share

The journey of moving from Rails 4.2 to Rails 5 was nothing short of a rollercoaster ride. This blog is all about what were the steps taken in order to achieve the changes faster and effectively so that you won’t have to face the challenges in future rails upgrades.

**Always have a better code coverage ( > 85% atleast )**

Code coverage ensures that we have tested most parts of our code and this would help in the rails upgrade. So what we followed is to increase the code coverage step by step.

First we went ahead and checked out which all files didn’t have any specs and added those first. This step alone helped us to increase code coverage to more than 80%.

Secondly we checked into the rcov report to find which all files had the least coverage and increased their coverage.

Thirdly we looked into any unused methods and legacy files that could be removed.

Finally we managed to cross the magic 90% code coverage.

**Fix all deprecations warnings**

This step is related to the previous step because when we run the test we could get a lot of deprecations warnings meaning those could fail in the future upgrade of rails.

IMO we need to do this step after upgrading to a new rails version too since we don’t have to tackle them in future upgrade.

**Upgrading Rails**

Now we are ready to upgrade our app’s rails version. We need to add the rails version to the gemfile and hit `bundle upgrade rails` , then we can use the task `rails app:update` to update the config files. We could skip that step and go with our old config if we feel like but its worth checking the changes.

**Upgrading Gems**

Next step is to find the compatible gem for the updated version of rails. For this I used [RailsBump](https://railsbump.org/). This step is a little tricky if you are using a patched version for any gem since you would manually have to update the patched version also to support the new rails version. Same with in-house gems.

**Final Steps**

Now we have to repeat step 2 i.e, fixing the deprecation warnings and that would also give us any failure we have to fix in our test files or the app logic. And finally we have to test our App and deploy the new version of rails .

Following these above steps helped us to move faster from Rails 4 to Rails 5 to now to Rails 6 and we are hoping to keep up the momentum.
