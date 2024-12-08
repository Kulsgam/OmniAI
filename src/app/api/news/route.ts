import { NextResponse } from 'next/server';
import axios from "axios";

const NEWS_API_URL = "https://newsapi.org/v2/everything";
const NEWS_API_KEY = process.env.NEWS_API_KEY;

type Article = {
    author: string;
    title: string;
    description: string;
    url: string;
}

export async function GET(request: Request ) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "latest";
    const pageSize = 100;
    // const query= "tesla";
    const res = await axios.get(`${NEWS_API_URL}?q=${query}&pageSize=${pageSize}&apiKey=${NEWS_API_KEY}`);
    const data = res.data;
    const articles = data.articles;
    const articleLinks = articles.map((article: Article) => article.url);
    const articleLinksCleaned = articleLinks.filter((link: string) => !link.includes("removed.com"));
    return NextResponse.json(articleLinksCleaned);
}