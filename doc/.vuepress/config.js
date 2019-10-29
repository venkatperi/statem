module.exports = {
  title: "StateM",
  base: "/statem/",
  dest: "docs",
  themeConfig: {

    displayAllHeaders: false,
    nav: [
      { text: "Github", link: "https://github.com/venkatperi/statem" }
    ],

    sidebar: [
      "/",
      {
        title: "Examples",
        children: [
          "/demo/hotelsafe",
          "/demo/toggleButtonWithCount",
          "/demo/pushButtonCountdownTimer",
        ]
      }
    ]

  }
}
