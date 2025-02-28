"use client";

import { useEffect, useState } from "react";
import {
  getProcessedRequirements,
  getGeneratedTestCases,
  getGeneratedSummaries,
  getOriginalContent,
} from "./actions";

export function useRequirements() {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    getProcessedRequirements().then(setData);
  }, []);
  return data;
}

export function useTestCases() {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    getGeneratedTestCases().then(setData);
  }, []);
  return data;
}

export function useSummary() {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    getGeneratedSummaries().then(setData);
  }, []);
  return data;
}

export function useOriginalContent() {
  const [data, setData] = useState<string | null>(null);
  useEffect(() => {
    getOriginalContent().then(setData);
  }, []);
  return data;
}
