export default function(eleventyConfig) {
  // Copy only assets directory
  eleventyConfig.addPassthroughCopy("src/assets");
  
  // Set input and output directories
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "html"],
    htmlTemplateEngine: "njk"
  };
}