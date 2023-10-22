/** @type {import('next').NextConfig} */
module.exports = {
  images: {
    domains: ["cdn.discordapp.com"],
  },
  reactStrictMode: false, // Was forcing useEffect to run twice on dev
};
