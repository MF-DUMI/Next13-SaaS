"use client";

import axios from "axios";
import * as z from "zod";
import { Heading } from "@/components/heading";
import { FileText, Briefcase } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/text-area";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Empty } from "@/components/empty";
import { Loader } from "@/components/loader";
import { useProModal } from "@/hooks/use-pro-modal";
import toast from "react-hot-toast";

const formSchema = z.object({
  userInfo: z.string().min(1, "Please enter your information"),
  jobDescription: z.string().min(1, "Job description is required"),
});

const ResumeTailoringPage = () => {
  const router = useRouter();
  const proModal = useProModal();

  const [tailoredResume, setTailoredResume] = useState<string | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userInfo: "",
      jobDescription: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const response = await axios.post("/api/resume", values);
      setTailoredResume(response.data.tailoredResume);
      //form.reset();
    } catch (error: any) {
        if (error?.response?.status===403){
          proModal.onOpen();
      }else{
        toast.error("Something went wrong")
    }
    } finally {
      router.refresh();
    }
  };

  return (
    <div>
      <Heading
        title="Resume Tailoring"
        description="Enter your information and job description to get a tailored resume"
        icon={FileText}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              name="userInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Information</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter your skills, work experience, project experience, and extra-curriculars here"
                      {...field}
                      rows={10}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              name="jobDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Paste the job description here"
                      {...field}
                      rows={5}
                      disabled={isLoading}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full">
              Tailor Resume
            </Button>
          </form>
        </Form>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {!tailoredResume && !isLoading && (
            <Empty label="No tailored resume yet" />
          )}
          {tailoredResume && (
            <div className="p-4 bg-white border rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Tailored Resume</h3>
              <pre className="whitespace-pre-wrap">{tailoredResume}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeTailoringPage;