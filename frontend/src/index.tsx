import ReactDOM from 'react-dom/client';

import { BrowserRouter, Route, Routes } from 'react-router-dom';

import AssignmentList from '@/pages/assignmentList';
import Upload from '@/pages/upload';
import { ForumDetails } from '@/pages/forumdetails/forumDetails';
import PageNotFound from '@/pages/pageNotFound';

import Layout from '@/components/layout';

import './main.css';

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

root.render(
    <BrowserRouter>
        <Layout>
            <Routes>
                <Route path="/" element={ <AssignmentList /> } />
                <Route path="/upload" element={ <Upload /> } />
                <Route path="/assignment" element={ <ForumDetails /> } />

                <Route path="*" element={ <PageNotFound /> } />
            </Routes>
        </Layout>
    </BrowserRouter>
);
