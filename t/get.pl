#!/usr/bin/env perl
use HTTP::Request;
use LWP::UserAgent;
use JSON;

my $url = "http://localhost:3000/rest/vacation/";

my $req = HTTP::Request->new(GET => $url);
$req->header("Cookie" =>
    "peribeco_session=e5fa191433b8a9bd5b7ea1e76ee5d1e4458051b1");
$req->content_type('application/json');

my $ua = LWP::UserAgent->new;
my $res = $ua->request($req);
print $res->decoded_content , "\n";
